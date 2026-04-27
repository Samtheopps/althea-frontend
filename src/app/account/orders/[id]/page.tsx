'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Loader2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/lib/i18n';
import accountService, {
  getAccountErrorMessage,
  ORDER_STATUS_LABELS,
} from '@/services/accountService';
import type { Order, OrderStatus } from '@/types/account';
import { T } from '@/components/ui/TranslatedText';

const STATUS_META: Record<
  OrderStatus,
  { color: string; bg: string; icon: React.ElementType }
> = {
  PENDING: { color: '#b45309', bg: '#fef3c7', icon: Clock },
  PROCESSING: { color: '#0369a1', bg: '#e0f2fe', icon: Package },
  SHIPPED: { color: '#6d28d9', bg: '#ede9fe', icon: Truck },
  DELIVERED: { color: '#065f46', bg: '#d1fae5', icon: CheckCircle2 },
  CANCELLED: { color: '#991b1b', bg: '#fee2e2', icon: XCircle },
};

const fmt = (n: number | string | null | undefined) => {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  if (num == null || Number.isNaN(num)) return '—';
  return num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Le backend peut renvoyer le montant sous divers noms
const pickAmount = (...candidates: unknown[]): number | string | null | undefined => {
  for (const c of candidates) {
    if (c != null && c !== '') return c as number | string;
  }
  return null;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = params?.id;
  const { user } = useAuthStore();
  const { tr } = useI18n();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  const loadOrder = useCallback(
    async (opts: { silent?: boolean } = {}) => {
      if (!orderId) return;
      try {
        if (opts.silent) setRefreshing(true);
        else setLoading(true);
        setNotFound(false);
        const data = await accountService.getOrder(orderId);
        setOrder(data);
      } catch (err) {
        if (!opts.silent) {
          const msg = getAccountErrorMessage(err, 'Impossible de charger la commande.');
          toast.error(msg);
          setNotFound(true);
        }
      } finally {
        if (opts.silent) setRefreshing(false);
        else setLoading(false);
      }
    },
    [orderId],
  );

  useEffect(() => {
    if (user && orderId) loadOrder();
  }, [user, orderId, loadOrder]);

  // Polling temps réel — s'arrête sur statuts terminaux, pause hors-écran.
  useEffect(() => {
    if (!user || !orderId || !order) return;
    const terminal = order.status === 'DELIVERED' || order.status === 'CANCELLED';
    if (terminal) return;

    const tick = () => {
      if (document.visibilityState === 'visible') loadOrder({ silent: true });
    };
    const interval = window.setInterval(tick, 10000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') loadOrder({ silent: true });
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onVisibility);
    };
  }, [user, orderId, order, loadOrder]);

  if (!user) return null;

  const handleCancel = async () => {
    if (!order) return;
    try {
      setCancelling(true);
      const updated = await accountService.cancelOrder(order.id);
      setOrder(updated);
      toast.success('Commande annulée'); //TODO i18n
      setConfirmingCancel(false);
    } catch (err) {
      toast.error(getAccountErrorMessage(err, 'Impossible d\'annuler cette commande.'));
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order || downloadingInvoice) return;
    try {
      setDownloadingInvoice(true);
      await accountService.downloadInvoicePdf(order);
    } catch (err) {
      toast.error(getAccountErrorMessage(err, 'Impossible de télécharger la facture.'));
    } finally {
      setDownloadingInvoice(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-3 mb-8 animate-pulse">
            <div className="w-9 h-9 rounded-lg bg-slate-200" />
            <div className="space-y-2">
              <div className="h-5 w-40 bg-slate-200 rounded" />
              <div className="h-3 w-24 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3"
              >
                <div className="h-3 bg-slate-200 rounded w-1/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-50">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h1 className="font-heading font-bold text-xl text-slate-800 mb-2">
            <T>Commande introuvable</T>
          </h1>
          <p className="text-sm text-slate-500 mb-5">
            <T>{"Cette commande n'existe pas ou vous n'y avez pas accès."}</T>
          </p>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#00a8b5' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <T>Voir toutes mes commandes</T>
          </Link>
        </div>
      </div>
    );
  }

  const meta = STATUS_META[order.status] ?? STATUS_META.PENDING;
  const StatusIcon = meta.icon;
  const canCancel = order.status === 'PENDING';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/account/orders"
            className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-bold text-2xl text-slate-800 truncate">
              {order.orderNumber || order.id}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">{fmtDate(order.createdAt)}</p>
          </div>
          <span
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0"
            style={{ color: meta.color, background: meta.bg }}
          >
            {refreshing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <StatusIcon className="w-3.5 h-3.5" />
            )}
            <T>{ORDER_STATUS_LABELS[order.status]}</T>
          </span>
        </div>

        {/* Items */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-slate-800 text-sm">
              <T>Articles</T> ({order.items?.length ?? 0})
            </h2>
          </div>
          <div className="space-y-3">
            {(order.items ?? []).map((item) => {
              const lineTotal =
                item.totalPrice ?? (item.unitPrice ?? 0) * item.quantity;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-2 border-b border-slate-50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {tr.account.ordersArticles(item.quantity)}
                      {item.variantName ? ` · ${item.variantName}` : ''}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 flex-shrink-0">
                    {fmt(lineTotal)} €
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 space-y-1.5">
            {order.subtotal !== undefined && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>{tr.account.ordersSubtotalHT}</span>
                <span>{fmt(order.subtotal)} €</span>
              </div>
            )}
            {order.tax !== undefined && order.tax > 0 && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>TVA</span>
                <span>{fmt(order.tax)} €</span>
              </div>
            )}
            {order.shipping !== undefined && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>{tr.account.ordersShipping}</span>
                <span>
                  {order.shipping === 0
                    ? tr.account.ordersFreeShipping
                    : `${fmt(order.shipping)} €`}
                </span>
              </div>
            )}
            {order.discount !== undefined && order.discount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600">
                <span><T>Remise</T></span>
                <span>- {fmt(order.discount)} €</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-800 pt-1">
              <span>{tr.account.ordersTotalTTC}</span>
              <span style={{ color: '#00a8b5' }}>
                {fmt(
                  pickAmount(
                    order.totalAmount,
                    (order as unknown as Record<string, unknown>).total,
                    (order as unknown as Record<string, unknown>).totalTtc,
                    (order as unknown as Record<string, unknown>).grandTotal,
                    (order as unknown as Record<string, unknown>).amount,
                  ),
                )}{' '}
                €
              </span>
            </div>
          </div>
        </motion.div>

        {/* Shipping address */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-slate-800 text-sm">
              {tr.account.ordersShippingAddress}
            </h2>
          </div>
          {order.shippingAddress ? (
            <p className="text-sm text-slate-600 leading-relaxed">
              {(order.shippingAddress.firstName || order.shippingAddress.lastName) && (
                <>
                  <span className="font-medium text-slate-700">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </span>
                  <br />
                </>
              )}
              {order.shippingAddress.street}
              <br />
              {order.shippingAddress.postalCode} {order.shippingAddress.city}
              <br />
              {order.shippingAddress.country}
            </p>
          ) : (
            <p className="text-sm text-slate-400">
              <T>Aucune adresse renseignée</T>
            </p>
          )}
          {order.shippingMethod?.name && (
            <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
              <T>Mode de livraison</T> : <T>{order.shippingMethod.name}</T>
            </p>
          )}
        </motion.div>

        {/* Invoice download */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-slate-800 text-sm">
              <T>Facture</T>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            <T>Téléchargez votre facture au format PDF pour vos archives comptables.</T>
          </p>
          <button
            onClick={handleDownloadInvoice}
            disabled={downloadingInvoice}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: '#00a8b5' }}
          >
            {downloadingInvoice ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <T>{downloadingInvoice ? 'Téléchargement…' : 'Télécharger la facture (PDF)'}</T>
          </button>
        </motion.div>

        {/* Cancel */}
        {canCancel && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-red-100 shadow-sm p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">
                  <T>Annuler cette commande</T>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  <T>{"Vous pouvez annuler tant qu'elle n'est pas encore en préparation."}</T>
                </p>
              </div>
            </div>

            {!confirmingCancel ? (
              <button
                onClick={() => setConfirmingCancel(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <T>Annuler la commande</T>
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {cancelling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <T>{"Confirmer l'annulation"}</T>
                </button>
                <button
                  onClick={() => setConfirmingCancel(false)}
                  disabled={cancelling}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  {tr.common.cancel}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
