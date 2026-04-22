'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Package,
  MapPin,
  CreditCard,
  ArrowRight,
  Clock,
  Truck,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import { useI18n } from '@/lib/i18n';
import checkoutService from '@/services/checkoutService';
import accountService from '@/services/accountService';
import type { Address } from '@/types/account';

/* ── Types flexibles pour absorber les deux shapes d'Order ── */
type RawOrder = {
  id: string;
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
  createdAt: string;
  items?: Array<Record<string, unknown> & {
    id: string;
    quantity: number;
  }>;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  total?: number;
  totalAmount?: number;
  currency?: string;
  shippingMethod?: { id?: string; name?: string; code?: string };
  shippingAddressId?: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    firstName?: string;
    lastName?: string;
    address?: string;
    address1?: string;
    address2?: string;
    region?: string;
    phone?: string;
  };
};

type NormalizedStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

function normalizeStatus(raw?: string): NormalizedStatus {
  const s = (raw || '').toUpperCase();
  if (s === 'PROCESSING' || s === 'CONFIRMED') return 'PROCESSING';
  if (s === 'SHIPPED') return 'SHIPPED';
  if (s === 'DELIVERED') return 'DELIVERED';
  if (s === 'CANCELLED' || s === 'CANCELED') return 'CANCELLED';
  return 'PENDING';
}

const STATUS_BANNER: Record<
  NormalizedStatus,
  {
    title: string;
    desc: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
  }
> = {
  PENDING: {
    title: 'Votre commande est en attente de traitement',
    desc: 'Nous finalisons la prise en charge de votre paiement, cela peut prendre quelques instants.',
    icon: Clock,
    color: '#b45309',
    bg: '#fef3c7',
    border: '#fde68a',
  },
  PROCESSING: {
    title: 'Votre commande est en cours de préparation',
    desc: 'Nos équipes préparent votre colis. Vous recevrez un email dès son expédition.',
    icon: Package,
    color: '#065f46',
    bg: '#d1fae5',
    border: '#a7f3d0',
  },
  SHIPPED: {
    title: 'Commande expédiée',
    desc: 'Votre colis est en route. Un email de suivi vous a été envoyé.',
    icon: Truck,
    color: '#065f46',
    bg: '#d1fae5',
    border: '#a7f3d0',
  },
  DELIVERED: {
    title: 'Commande livrée',
    desc: 'Votre colis a été livré. Nous espérons qu\'il vous convient !',
    icon: CheckCircle2,
    color: '#065f46',
    bg: '#d1fae5',
    border: '#a7f3d0',
  },
  CANCELLED: {
    title: 'Commande annulée',
    desc: 'Cette commande a été annulée. Aucune somme ne sera débitée.',
    icon: XCircle,
    color: '#991b1b',
    bg: '#fee2e2',
    border: '#fecaca',
  },
};

function ConfirmationContent() {
  const { tr } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentIntentId = searchParams.get('paymentIntentId');
  const sessionId = searchParams.get('sessionId');

  const [order, setOrder] = useState<RawOrder | null>(null);
  const [fetchedAddress, setFetchedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1) paymentIntentId PRIORITAIRE — on arrive tout juste de Stripe,
      //    il faut confirmer ce paiement pour obtenir la NOUVELLE commande
      //    associée. Ne jamais tomber sur le localStorage ici, sinon on
      //    réaffiche la commande précédente.
      if (paymentIntentId) {
        setPending(true);
        setLoading(false);
        try {
          const fetched = (await checkoutService.confirmOrder(
            paymentIntentId,
            sessionId ?? undefined,
          )) as unknown as RawOrder;
          if (!cancelled) {
            try {
              localStorage.setItem('althea_last_order', JSON.stringify(fetched));
            } catch {
              /* ignore */
            }
            setOrder(fetched);
            setPending(false);
          }
        } catch (err) {
          console.error('[confirmation] confirmOrder failed:', err);
          if (!cancelled) {
            setPending(false);
            setFailed(true);
          }
        }
        return;
      }

      // 2) orderId explicite dans l'URL → fetch direct
      if (orderId) {
        try {
          const fetched = (await checkoutService.getOrder(orderId)) as unknown as RawOrder;
          if (!cancelled) {
            try {
              localStorage.setItem('althea_last_order', JSON.stringify(fetched));
            } catch {
              /* ignore */
            }
            setOrder(fetched);
            setLoading(false);
            return;
          }
        } catch {
          /* ignore, on tentera le fallback localStorage */
        }
      }

      // 3) fallback : reload sur /checkout/confirmation sans paramètres
      //    → on montre la dernière commande connue (utile si refresh
      //    accidentel de la page).
      try {
        const raw = localStorage.getItem('althea_last_order');
        if (raw) {
          const parsed = JSON.parse(raw) as RawOrder;
          if (!orderId || parsed?.id === orderId) {
            if (!cancelled) {
              setOrder(parsed);
              setLoading(false);
              return;
            }
          }
        }
      } catch {
        /* ignore */
      }

      if (!cancelled) router.replace('/');
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId, paymentIntentId, sessionId, router]);

  // Polling temps réel : rafraîchit le statut tant que la commande n'est pas en
  // état terminal (DELIVERED / CANCELLED). Pause quand la page est masquée.
  useEffect(() => {
    if (!order?.id) return;
    const status = normalizeStatus(order.status);
    if (status === 'DELIVERED' || status === 'CANCELLED') return;

    let cancelled = false;
    const refresh = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const fresh = (await checkoutService.getOrder(order.id)) as unknown as RawOrder;
        if (!cancelled && fresh) {
          setOrder(fresh);
          try {
            localStorage.setItem('althea_last_order', JSON.stringify(fresh));
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* ignore — on retentera au prochain tick */
      }
    };

    const interval = window.setInterval(refresh, 8000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onVisibility);
    };
  }, [order?.id, order?.status]);

  // Si l'order n'inclut pas les détails de l'adresse mais juste un shippingAddressId,
  // on fetch l'adresse séparément via /users/me/addresses.
  useEffect(() => {
    if (!order) return;
    const hasAddressDetails =
      order.shippingAddress &&
      (order.shippingAddress.street ||
        order.shippingAddress.address ||
        order.shippingAddress.address1 ||
        order.shippingAddress.city);
    if (hasAddressDetails) return;

    const targetId = order.shippingAddressId;
    let cancelled = false;

    (async () => {
      try {
        const addresses = await accountService.getAddresses();
        if (cancelled) return;
        const found = targetId
          ? addresses.find((a) => a.id === targetId)
          : addresses.find((a) => a.isDefault) || addresses[0];
        if (found) setFetchedAddress(found);
      } catch (err) {
        console.warn('[confirmation] could not fetch address:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (pending) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-md w-full text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#e0f7f9' }}
          >
            <div className="w-6 h-6 border-2 border-[#00a8b5] border-t-transparent rounded-full animate-spin" />
          </div>
          <h1 className="font-heading font-bold text-xl text-slate-800 mb-2">
            {/* //TODO i18n */}Paiement confirmé
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            {/* //TODO i18n */}
            Votre paiement a bien été accepté. Nous finalisons la création de votre
            commande, cela peut prendre quelques secondes&hellip;
          </p>
        </div>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-50">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h1 className="font-heading font-bold text-xl text-slate-800 mb-2">
            {/* //TODO i18n */}Paiement accepté
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            {/* //TODO i18n */}
            Votre paiement a été accepté mais la création de la commande prend plus
            de temps que prévu. Elle apparaîtra dans votre espace client dès
            qu&apos;elle sera prête.
          </p>
          {paymentIntentId && (
            <p className="text-xs text-slate-400 mb-4 font-mono break-all">
              {/* //TODO i18n */}Réf. paiement : {paymentIntentId}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href="/account/orders"
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#00a8b5' }}
            >
              {/* //TODO i18n */}Voir toutes mes commandes
            </Link>
            <Link
              href="/"
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700"
            >
              {/* //TODO i18n */}Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  // Debug : log l'order complet pour voir les champs réels du backend
  console.log('[confirmation] order received:', order);

  /* ── Normalisation des champs ── */
  const status = normalizeStatus(order.status);
  const banner = STATUS_BANNER[status];
  const BannerIcon = banner.icon;

  const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const orderLabel = order.orderNumber || order.id;

  const pickNum = (...cands: unknown[]): number => {
    for (const c of cands) {
      if (c == null || c === '') continue;
      const n = typeof c === 'string' ? parseFloat(c) : (c as number);
      if (!Number.isNaN(n)) return n;
    }
    return 0;
  };

  const raw = order as unknown as Record<string, unknown>;
  const totalAmount = pickNum(
    raw.totalAmount,
    raw.total,
    raw.totalTtc,
    raw.grandTotal,
    raw.amount,
  );
  const subtotal = pickNum(raw.subtotal, raw.subTotal, raw.totalHt);
  const tax = pickNum(raw.tax, raw.vat, raw.totalVat);
  const shipping = pickNum(raw.shipping, raw.shippingCost, raw.shippingFee);
  const discount = pickNum(raw.discount, raw.discountAmount);
  const items = order.items ?? [];

  // shippingAddress : on gère plusieurs shapes possibles, et fallback sur
  // fetchedAddress si l'order n'inclut pas les détails.
  const addrFromOrder = order.shippingAddress ??
    (raw.shipping_address as typeof order.shippingAddress) ??
    (raw.deliveryAddress as typeof order.shippingAddress);

  const hasOrderAddress =
    addrFromOrder &&
    (addrFromOrder.street ||
      addrFromOrder.address ||
      addrFromOrder.address1 ||
      addrFromOrder.city);

  const addr = hasOrderAddress
    ? (addrFromOrder as NonNullable<typeof order.shippingAddress>)
    : fetchedAddress
      ? ({
          street: fetchedAddress.street,
          city: fetchedAddress.city,
          postalCode: fetchedAddress.postalCode,
          country: fetchedAddress.country,
        } as NonNullable<typeof order.shippingAddress>)
      : ({} as NonNullable<typeof order.shippingAddress>);
  const addrStreet = addr.street ?? addr.address ?? addr.address1 ?? '';
  const addrLine2 = addr.address2 ?? '';
  const addrLine1 =
    addr.firstName || addr.lastName
      ? `${addr.firstName ?? ''} ${addr.lastName ?? ''}`.trim()
      : '';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="flex justify-center mb-10">
        <Logo size="lg" />
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* ── Status banner ── */}
        <div
          className="rounded-2xl border p-5 flex items-start gap-4"
          style={{ background: banner.bg, borderColor: banner.border }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.6)' }}
          >
            <BannerIcon className="w-5 h-5" style={{ color: banner.color }} />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading font-bold text-base" style={{ color: banner.color }}>
              {banner.title}
            </h2>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: banner.color, opacity: 0.85 }}>
              {banner.desc}
            </p>
          </div>
        </div>

        {/* ── Confirmation header ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#e0f7f9' }}
          >
            <CheckCircle2 className="w-8 h-8" style={{ color: '#00a8b5' }} />
          </div>
          <h1 className="font-heading font-bold text-2xl text-slate-800 mb-1">
            {tr.checkout.confirmed}
          </h1>
          <p className="text-slate-500 text-sm mb-4">{tr.checkout.confirmedDesc}</p>
          <div
            className="inline-block px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: '#e0f7f9', color: '#007a85' }}
          >
            N° {orderLabel}
          </div>
          <p className="text-xs text-slate-400 mt-2">{orderDate}</p>
        </div>

        {/* ── Items ── */}
        {items.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-slate-400" />
              <h2 className="font-semibold text-slate-800 text-sm">
                {tr.checkout.orderedItems}
              </h2>
            </div>
            <div className="space-y-3">
              {items.map((item) => {
                const it = item as Record<string, unknown>;
                const product = (it.product ?? it.productSnapshot) as
                  | Record<string, unknown>
                  | undefined;
                const variant = (it.variant ?? it.productVariant) as
                  | Record<string, unknown>
                  | undefined;

                const name =
                  (it.productName as string | undefined) ||
                  (it.name as string | undefined) ||
                  (it.title as string | undefined) ||
                  (product?.name as string | undefined) ||
                  (product?.title as string | undefined) ||
                  (variant?.name as string | undefined) ||
                  'Article';

                const unitPrice = pickNum(
                  it.unitPrice,
                  it.price,
                  it.pricePerUnit,
                  it.unitAmount,
                  it.priceTtc,
                  it.priceHt,
                  variant?.price,
                  product?.price,
                  product?.priceTtc,
                );
                const totalPriceRaw = pickNum(
                  it.totalPrice,
                  it.total,
                  it.lineTotal,
                  it.subtotal,
                  it.amount,
                );
                const lineTotal = totalPriceRaw || unitPrice * item.quantity;

                return (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-slate-700">
                      <span className="text-slate-400 mr-2">×{item.quantity}</span>
                      {name}
                    </span>
                    <span className="font-medium text-slate-800">
                      {formatPrice(lineTotal)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-100 mt-4 pt-4 space-y-1.5">
              {subtotal > 0 && (
                <div className="flex justify-between text-sm text-slate-500">
                  <span>{tr.checkout.subtotalHT}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-sm text-slate-500">
                  <span>{tr.checkout.taxLine}</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              )}
              {(shipping > 0 || subtotal > 0) && (
                <div className="flex justify-between text-sm text-slate-500">
                  <span>{tr.checkout.deliveryLabel}</span>
                  <span>
                    {shipping === 0 ? tr.checkout.shippingFreeLabel : formatPrice(shipping)}
                  </span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>{/* //TODO i18n */}Remise</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-100">
                <span>{tr.checkout.grandTotalLabel}</span>
                <span style={{ color: '#00a8b5' }}>{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Address + Payment ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-slate-400" />
              <h2 className="font-semibold text-slate-800 text-sm">
                {tr.checkout.deliveryLabel}
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {addrLine1 && <>{addrLine1}<br /></>}
              {addrStreet && <>{addrStreet}<br /></>}
              {addrLine2 && <>{addrLine2}<br /></>}
              {addr.postalCode} {addr.city}
              <br />
              {addr.country}
            </p>
            {order.shippingMethod?.name && (
              <p className="text-xs text-slate-400 mt-2">
                {/* //TODO i18n */}Mode : {order.shippingMethod.name}
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-slate-400" />
              <h2 className="font-semibold text-slate-800 text-sm">
                {tr.checkout.paymentLabel}
              </h2>
            </div>
            <p className="text-sm text-slate-600">{tr.checkout.bankCard}</p>
            {order.paymentStatus && (
              <p className="text-xs text-slate-400 mt-2">
                {/* //TODO i18n */}Statut : {order.paymentStatus}
              </p>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/products"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {tr.checkout.continueShopping}
          </Link>
          <Link
            href="/account/orders"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: '#00a8b5' }}
          >
            {/* //TODO i18n */}Voir toutes mes commandes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-center text-xs text-slate-400 pb-4">
          {tr.checkout.contactNote}{' '}
          <a href="mailto:contact@altheasystems.fr" className="underline">
            contact@altheasystems.fr
          </a>
        </p>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
