'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import type { Appearance, StripeElementsOptions } from '@stripe/stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Truck,
  ArrowLeft,
  Check,
  Lock,
  ChevronRight,
  MapPin,
  User,
  UserPlus,
  UserCheck,
  Plus,
  Zap,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { formatPrice } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import { useI18n } from '@/lib/i18n';
import { getStripe } from '@/lib/stripe';
import checkoutService, {
  getCheckoutErrorMessage,
} from '@/services/checkoutService';
import type {
  ShippingOption,
  UserAddress,
} from '@/types/checkout';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';

/* ── Stripe appearance (matche la charte Althea) ────────── */
const stripeAppearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#00a8b5',
    colorBackground: '#ffffff',
    colorText: '#0f172a',
    colorDanger: '#dc2626',
    fontFamily: 'Inter, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '12px',
  },
  rules: {
    '.Input': {
      borderColor: '#e2e8f0',
      boxShadow: 'none',
      padding: '12px',
    },
    '.Input:focus': {
      borderColor: '#00a8b5',
      boxShadow: '0 0 0 3px rgba(0,168,181,.15)',
    },
    '.Label': {
      fontWeight: '600',
      color: '#475569',
    },
    '.Tab': {
      borderColor: '#e2e8f0',
    },
    '.Tab--selected': {
      borderColor: '#00a8b5',
      color: '#00a8b5',
    },
  },
};

/* ── Icône par code de livraison ────────────────────────── */
const SHIPPING_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  standard: Truck,
  express: Zap,
  premium: Sparkles,
};

export default function CheckoutPage() {
  const { tr } = useI18n();
  const router = useRouter();
  const { items, getTotalPrice, clearCart, isHydrated } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const STEPS = useMemo(
    () => [
      { id: 1, label: tr.checkout.stepAuth, icon: User },
      { id: 2, label: tr.checkout.stepDelivery, icon: Truck },
      { id: 3, label: tr.checkout.stepPayment, icon: CreditCard },
      { id: 4, label: tr.checkout.stepConfirmation, icon: Check },
    ],
    [tr],
  );

  /* ── State global ─────────────────────────────────────── */
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [termsAgreed, setTermsAgreed] = useState(false);

  /* ── Shipping options & addresses ─────────────────────── */
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingShippingStep, setLoadingShippingStep] = useState(false);

  /* ── Flag : aucune adresse enregistrée ────────────────── */
  const [noAddressYet, setNoAddressYet] = useState(false);

  /* ── Payment state ────────────────────────────────────── */
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPostPayment, setIsPostPayment] = useState(false);

  /* ── Stripe promise (singleton) ───────────────────────── */
  const stripePromise = useMemo(() => getStripe(), []);

  // Redirect si cart vide (uniquement après hydratation persist terminée).
  // IMPORTANT : on désactive ce redirect après paiement, sinon le clearCart()
  // post-paiement relance ce useEffect et renvoie vers /cart au lieu de
  // laisser la navigation vers /checkout/confirmation se faire.
  useEffect(() => {
    if (!isHydrated) return;
    if (isPostPayment) return;
    if (items.length === 0) router.push('/cart');
  }, [isHydrated, items.length, router, isPostPayment]);

  // Auto-skip step 1 si connecté
  useEffect(() => {
    if (isHydrated && isAuthenticated && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [isHydrated, isAuthenticated, currentStep]);

  /* ── Étape 2 : sync cart + charger shipping options + adresses ─ */
  useEffect(() => {
    if (currentStep !== 2 || !isAuthenticated || !isHydrated) return;

    let cancelled = false;
    setLoadingShippingStep(true);

    (async () => {
      try {
        // 0) Synchroniser le panier local (localStorage Zustand) vers le backend.
        // Indispensable car /checkout/validate regarde le panier côté serveur (DB),
        // pas celui du navigateur.
        if (items.length > 0) {
          await checkoutService.mergeAnonymousCart(
            items.map((i) => ({
              productId: i.product.id,
              quantity: i.quantity,
            })),
          );
        }

        // 1) Valider le panier backend
        const validation = await checkoutService.validateCart();
        if (cancelled) return;
        if (!validation.valid) {
          const firstError = validation.errors?.[0];
          toast.error(firstError?.message || 'Panier invalide.');
          return; // on reste sur la page — l'user peut retenter ou retourner au panier manuellement
        }

        // 2) Charger options + adresses en parallèle
        const [options, userAddresses] = await Promise.all([
          checkoutService.getShippingOptions(),
          checkoutService.getUserAddresses(),
        ]);

        if (cancelled) return;

        setShippingOptions(options);
        // Présélectionner "standard" par défaut, sinon le premier
        const defaultOption =
          options.find((o) => o.id === 'standard' || o.code === 'standard') || options[0];
        if (defaultOption) setSelectedShippingId(defaultOption.id);

        setAddresses(userAddresses);
        const defaultAddr =
          userAddresses.find((a) => a.isDefault) || userAddresses[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setNoAddressYet(false);
        } else {
          setNoAddressYet(true);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[checkout] step 2 init failed:', err);
          toast.error(getCheckoutErrorMessage(err, 'Impossible de charger les options de livraison.'));
        }
      } finally {
        if (!cancelled) setLoadingShippingStep(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentStep, isAuthenticated, isHydrated, items, router]);

  /* ── Totaux affichage (fallback client) ────────────────── */
  // Les prix du panier sont TTC (product.price = product.priceTtc côté backend).
  // On décompose pour afficher HT / TVA / TTC proprement, sans double TVA.
  const cartTotalTTC = getTotalPrice();
  const selectedShipping = shippingOptions.find((o) => o.id === selectedShippingId);
  const shippingCost = selectedShipping?.price ?? (cartTotalTTC >= 100 ? 0 : 15);
  const VAT_RATE = 0.2;
  const cartSubtotal = cartTotalTTC / (1 + VAT_RATE); // HT
  const taxAmount = cartTotalTTC - cartSubtotal; // TVA extraite du TTC
  const grandTotal = cartTotalTTC + shippingCost;

  /* ── Passer à l'étape 3 : créer session + payment intent ── */
  const goToPayment = useCallback(async () => {
    setPaymentError(null);

    if (noAddressYet) {
      toast.error(
        "Aucune adresse enregistrée. Ajoutez une adresse depuis votre compte avant de commander.", //TODO i18n
      );
      return;
    }
    if (!selectedAddressId) {
      toast.error('Veuillez sélectionner une adresse de livraison.'); //TODO i18n
      return;
    }
    if (!selectedShippingId) {
      toast.error('Veuillez sélectionner un mode de livraison.'); //TODO i18n
      return;
    }

    setLoadingPayment(true);
    try {
      // Le backend attend le code shipping en MINUSCULES : standard / express / premium
      const option = shippingOptions.find((o) => o.id === selectedShippingId);
      const shippingMethodId = (option?.id || option?.code || selectedShippingId).toLowerCase();

      // 1) Créer la session shipping — retourne sessionId + totalAmount
      const session = await checkoutService.createShippingSession(
        selectedAddressId,
        shippingMethodId,
      );
      const sessionId = session.sessionId || session.id;
      if (!sessionId) throw new Error('Session ID manquant dans la réponse.');

      // 2) Créer le PaymentIntent avec le sessionId
      const intent = await checkoutService.createPaymentIntent(sessionId);
      setClientSecret(intent.clientSecret);
      setCurrentSessionId(sessionId);
      setCurrentStep(3);
    } catch (err) {
      const axiosErr = err as AxiosError<unknown>;
      console.error(
        '[checkout] goToPayment failed:',
        JSON.stringify(
          {
            status: axiosErr.response?.status,
            url: axiosErr.config?.url,
            body: axiosErr.response?.data,
            sentPayload: axiosErr.config?.data,
          },
          null,
          2,
        ),
      );
      toast.error(getCheckoutErrorMessage(err, 'Impossible de préparer le paiement.'));
    } finally {
      setLoadingPayment(false);
    }
  }, [selectedAddressId, selectedShippingId, shippingOptions, noAddressYet]);

  /* ── Submit final : on bascule IMMÉDIATEMENT vers la page confirmation ── */
  // Le paiement Stripe est OK. Au lieu de bloquer ici en appelant confirmOrder,
  // on vide le panier et on redirige tout de suite vers /checkout/confirmation
  // qui prendra en charge la création de la commande (avec son propre retry
  // et son propre affichage d'état). Comme ça l'user voit TOUJOURS une page
  // de confirmation, quoi qu'il arrive côté backend.
  const handlePaymentSuccess = useCallback(
    async (paymentIntentId: string) => {
      // Bloquer la redirection auto vers /cart avant de vider le panier
      setIsPostPayment(true);
      const sessionParam = currentSessionId
        ? `&sessionId=${encodeURIComponent(currentSessionId)}`
        : '';
      router.push(
        `/checkout/confirmation?paymentIntentId=${encodeURIComponent(paymentIntentId)}${sessionParam}`,
      );
      // On vide le panier après la navigation
      clearCart();
    },
    [clearCart, router, currentSessionId],
  );

  /* ── Garde : hydratation ──────────────────────────────── */
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="space-y-3 w-64 animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  /* ────────────────────────────────────
     STEP 1 — Connexion / Invité
  ──────────────────────────────────── */
  const renderAuthStep = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-heading font-semibold text-lg text-slate-800 mb-1">
          {tr.checkout.identify}
        </h3>
        <p className="text-sm text-slate-500">{tr.checkout.identifyDesc}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href={`/login?redirect=${encodeURIComponent('/checkout')}`}
          className="group flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-slate-200 hover:border-primary hover:bg-primary-light transition-all duration-200 text-center"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: '#e0f7f9' }}
          >
            <User className="w-6 h-6" style={{ color: '#00a8b5' }} />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm group-hover:text-primary transition-colors">
              {tr.checkout.signInOption}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{tr.checkout.signInDesc}</p>
          </div>
        </a>

        <a
          href={`/register?redirect=${encodeURIComponent('/checkout')}`}
          className="group flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-slate-200 hover:border-primary hover:bg-primary-light transition-all duration-200 text-center"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: '#e0f7f9' }}
          >
            <UserPlus className="w-6 h-6" style={{ color: '#00a8b5' }} />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm group-hover:text-primary transition-colors">
              {tr.nav.createAccount}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {tr.checkout.createAccountDesc}
            </p>
          </div>
        </a>
      </div>

      {/* Avis guest bloqué */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
        <UserCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          {/* //TODO i18n */}
          Veuillez vous connecter pour finaliser la commande. Le paiement est réservé aux clients enregistrés.
        </p>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
        <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <p className="text-xs text-slate-500">{tr.checkout.sslNotice}</p>
      </div>
    </div>
  );

  /* ────────────────────────────────────
     STEP 2 — Livraison (adresse + méthode)
  ──────────────────────────────────── */
  const renderDeliveryStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading font-semibold text-lg text-slate-800 mb-1">
          {tr.checkout.deliveryTitle}
        </h3>
        <p className="text-sm text-slate-500">{tr.checkout.deliveryQuestion}</p>
      </div>

      {loadingShippingStep && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {!loadingShippingStep && (
        <>
          {/* ─── Adresses ─── */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">
              {/* //TODO i18n */}
              Adresse de livraison
            </p>

            {addresses.length > 0 ? (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-primary bg-primary-light'
                        : 'border-slate-200 hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="w-4 h-4 mt-0.5 accent-primary flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-slate-800 text-sm">
                          {addr.street}
                        </p>
                        {addr.isDefault && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: '#e0f7f9', color: '#00a8b5' }}
                          >
                            {/* //TODO i18n */}
                            Par défaut
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        {addr.postalCode} {addr.city}
                      </p>
                      <p className="text-xs text-slate-500">{addr.country}</p>
                    </div>
                  </label>
                ))}

                <a
                  href="/account/addresses"
                  className="flex items-center gap-2 text-xs text-primary hover:underline mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {/* //TODO i18n */}
                  Gérer mes adresses
                </a>
              </div>
            ) : (
              <div className="p-5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-center space-y-3">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm text-slate-600">
                  {/* //TODO i18n */}
                  Vous n&apos;avez pas encore d&apos;adresse enregistrée.
                </p>
                <a
                  href="/account/addresses"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: '#00a8b5' }}
                >
                  <Plus className="w-4 h-4" />
                  {/* //TODO i18n */}
                  Ajouter une adresse
                </a>
              </div>
            )}
          </div>

          {/* ─── Méthode de livraison ─── */}
          {shippingOptions.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">
                {/* //TODO i18n */}
                Mode de livraison
              </p>
              <div className="space-y-2">
                {shippingOptions.map((opt) => {
                  const Icon = SHIPPING_ICONS[opt.code] ?? Truck;
                  const active = selectedShippingId === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        active
                          ? 'border-primary bg-primary-light'
                          : 'border-slate-200 hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={opt.id}
                        checked={active}
                        onChange={() => setSelectedShippingId(opt.id)}
                        className="w-4 h-4 accent-primary flex-shrink-0"
                      />
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: '#e0f7f9' }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm">
                          {opt.name}
                        </p>
                        {opt.description && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {opt.description}
                          </p>
                        )}
                        {opt.estimatedDays && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {opt.estimatedDays}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-800 flex-shrink-0">
                        {opt.price === 0 ? tr.checkout.shippingFreeLabel : formatPrice(opt.price)}
                      </p>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={goToPayment}
            disabled={!selectedAddressId || !selectedShippingId || loadingPayment}
            className="btn btn-primary btn-lg w-full justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingPayment ? (
              <>
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                {/* //TODO i18n */}
                Préparation du paiement…
              </>
            ) : (
              <>
                {tr.checkout.continueToPayment}
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </>
      )}
    </div>
  );

  /* ────────────────────────────────────
     STEP 3 — Paiement Stripe
  ──────────────────────────────────── */
  const renderPaymentStep = () => {
    if (!clientSecret) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
        </div>
      );
    }

    const options: StripeElementsOptions = {
      clientSecret,
      appearance: stripeAppearance,
      locale: 'fr',
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-heading font-semibold text-lg text-slate-800 mb-1">
            {tr.checkout.paymentMethodTitle}
          </h3>
          <p className="text-sm text-slate-500">{tr.checkout.paymentMethodDesc}</p>
        </div>

        {paymentError && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 leading-relaxed">{paymentError}</p>
          </div>
        )}

        {/* CGV */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-primary flex-shrink-0"
            />
            <span className="text-sm text-slate-600 leading-relaxed">
              {tr.checkout.agreeTermsPrefix}{' '}
              <a href="/legal/cgu" className="text-primary font-medium hover:underline">
                {tr.checkout.termsLink}
              </a>{' '}
              {tr.checkout.termsConnector}{' '}
              <a
                href="/legal/privacy"
                className="text-primary font-medium hover:underline"
              >
                {tr.checkout.privacyPolicyLink}
              </a>
            </span>
          </label>
        </div>

        <Elements stripe={stripePromise} options={options}>
          <StripePaymentForm
            onBack={() => setCurrentStep(2)}
            onSuccess={handlePaymentSuccess}
            onStripeError={(msg) => {
              setPaymentError(msg);
              toast.error(msg);
            }}
            amountLabel={formatPrice(grandTotal)}
            termsAgreed={termsAgreed}
          />
        </Elements>
      </div>
    );
  };

  /* ────────────────────────────────────
     RENDER
  ──────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container-page py-3">
          <div className="flex items-center justify-between">
            <Logo size="sm" href="/" />
            <div className="flex items-center gap-4">
              <h1 className="hidden sm:block font-heading font-bold text-lg text-slate-800">
                {tr.checkout.pageTitle}
              </h1>
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
                aria-label={tr.common.back}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stepper */}
          <div className="mt-4 flex items-center justify-center gap-0">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const done = currentStep > step.id;
              const current = currentStep === step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                      style={
                        done
                          ? { background: '#00a8b5', borderColor: '#00a8b5', color: '#fff' }
                          : current
                            ? { background: '#fff', borderColor: '#00a8b5', color: '#00a8b5' }
                            : { background: '#fff', borderColor: '#e2e8f0', color: '#94a3b8' }
                      }
                    >
                      {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span
                      className="text-xs font-semibold transition-colors"
                      style={{
                        color: current ? '#00a8b5' : done ? '#0f172a' : '#94a3b8',
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className="w-16 sm:w-28 h-0.5 mb-5 mx-1.5 transition-all duration-300"
                      style={{ background: done ? '#00a8b5' : '#e2e8f0' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container-page py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  {currentStep === 1 && renderAuthStep()}
                  {currentStep === 2 && renderDeliveryStep()}
                  {currentStep === 3 && renderPaymentStep()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div
                className="px-6 py-4 border-b border-slate-100"
                style={{ background: '#f8fafc' }}
              >
                <h3 className="font-heading font-semibold text-slate-800">
                  {tr.checkout.summaryTitle} ({items.length})
                </h3>
              </div>

              <div className="px-6 py-4 space-y-4 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  const price =
                    (item.selectedVariant?.price ?? item.product.price) * item.quantity;
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.product.images?.[0] || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (img.src.endsWith('/placeholder-product.jpg')) return;
                            img.src = '/placeholder-product.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {tr.checkout.qtyLabel} {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 flex-shrink-0">
                        {formatPrice(price)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 space-y-2.5">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{tr.checkout.subtotalHT}</span>
                  <span>{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{tr.common.shipping}</span>
                  <span className={shippingCost === 0 ? 'text-emerald-600 font-medium' : ''}>
                    {shippingCost === 0
                      ? tr.checkout.shippingFreeLabel
                      : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{tr.checkout.taxLine}</span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-heading font-bold text-slate-800">
                    {tr.checkout.grandTotalLabel}
                  </span>
                  <span className="font-heading font-bold text-xl text-slate-900">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              <div
                className="px-6 py-3 flex items-center justify-center gap-2 border-t border-slate-100"
                style={{ background: '#f8fafc' }}
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400">{tr.checkout.secureFooter}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
