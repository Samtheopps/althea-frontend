'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Truck, Shield, ArrowLeft, Check, Lock,
  ChevronRight, MapPin, Building2, Phone, User, UserPlus, UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { addressSchema, type AddressInput } from '@/lib/validations';
import { formatPrice } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import { useI18n } from '@/lib/i18n';

interface CheckoutFormData {
  billingAddress: AddressInput;
  shippingAddress: AddressInput;
  paymentMethod: 'card' | 'transfer';
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  sameAsShipping: boolean;
  terms: boolean;
}


/* ── Reusable field ── */
function Field({
  label, error, required, children,
}: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function CheckoutPage() {
  const { tr } = useI18n();
  const router = useRouter();
  const { items, getTotalPrice, clearCart, isHydrated, setHydrated } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const STEPS = [
    { id: 1, label: tr.checkout.stepAuth,         icon: User },
    { id: 2, label: tr.checkout.stepDelivery,     icon: Truck },
    { id: 3, label: tr.checkout.stepPayment,      icon: CreditCard },
    { id: 4, label: tr.checkout.stepConfirmation, icon: Check },
  ];

  const [currentStep,   setCurrentStep]   = useState(() => isAuthenticated ? 2 : 1);
  const [isProcessing,  setIsProcessing]  = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<'card' | 'transfer'>('card');

  useEffect(() => { setHydrated(true); }, [setHydrated]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutFormData>({
    defaultValues: {
      billingAddress:  { type: 'billing',  firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', country: 'FR' },
      shippingAddress: { type: 'shipping', firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', country: 'FR' },
      paymentMethod: 'card',
      sameAsShipping: true,
      terms: false,
    },
  });

  const totalHT      = getTotalPrice();
  const totalTVA     = totalHT * 0.2;
  const totalTTC     = totalHT + totalTVA;
  const shippingCost = totalHT >= 100 ? 0 : 15;
  const grandTotal   = totalTTC + shippingCost;

  /* ── Loading state ── */
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

  useEffect(() => {
    if (!isHydrated) return;
    if (items.length === 0) router.push('/cart');
  }, [isHydrated, items.length, router]);

  if (isHydrated && items.length === 0) return null;

  /* ── Submit ── */
  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    try {
      const orderNumber = `ALT-${Date.now().toString(36).toUpperCase()}`;
      const order = {
        number: orderNumber,
        date: new Date().toISOString(),
        items: items.map(i => ({
          name: i.product.name,
          quantity: i.quantity,
          price: i.selectedVariant?.price ?? i.product.price,
        })),
        shippingAddress: data.shippingAddress,
        totalHT,
        totalTVA,
        totalTTC,
        shippingCost,
        grandTotal,
        paymentMethod: data.paymentMethod,
      };
      localStorage.setItem('althea_last_order', JSON.stringify(order));
      clearCart();
      router.push('/checkout/confirmation');
    } catch (err: any) {
      toast.error(err.message ?? tr.checkout.errorProcessing);
      setIsProcessing(false);
    }
  };

  /* ── Input class shorthand ── */
  const inputCls = 'input';

  /* ────────────────────────────────────
     STEP 1 — Connexion / Invité
  ──────────────────────────────────── */
  const renderAuthStep = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-heading font-semibold text-lg text-slate-800 mb-1">{tr.checkout.identify}</h3>
        <p className="text-sm text-slate-500">{tr.checkout.identifyDesc}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Se connecter */}
        <a
          href={`/auth/login?redirect=${encodeURIComponent('/checkout')}`}
          className="group flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-slate-200 hover:border-primary hover:bg-primary-light transition-all duration-200 text-center"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#e0f7f9' }}>
            <User className="w-6 h-6" style={{ color: '#00a8b5' }} />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm group-hover:text-primary transition-colors">{tr.checkout.signInOption}</p>
            <p className="text-xs text-slate-500 mt-0.5">{tr.checkout.signInDesc}</p>
          </div>
        </a>

        {/* Créer un compte */}
        <a
          href={`/auth/register?redirect=${encodeURIComponent('/checkout')}`}
          className="group flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-slate-200 hover:border-primary hover:bg-primary-light transition-all duration-200 text-center"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#e0f7f9' }}>
            <UserPlus className="w-6 h-6" style={{ color: '#00a8b5' }} />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm group-hover:text-primary transition-colors">{tr.nav.createAccount}</p>
            <p className="text-xs text-slate-500 mt-0.5">{tr.checkout.createAccountDesc}</p>
          </div>
        </a>

        {/* Invité */}
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="group flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-slate-200 hover:border-primary hover:bg-primary-light transition-all duration-200 text-center"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#e0f7f9' }}>
            <UserCheck className="w-6 h-6" style={{ color: '#00a8b5' }} />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm group-hover:text-primary transition-colors">{tr.checkout.continueGuestOption}</p>
            <p className="text-xs text-slate-500 mt-0.5">{tr.checkout.continueGuestDesc}</p>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
        <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <p className="text-xs text-slate-500">
          {tr.checkout.sslNotice}
        </p>
      </div>
    </div>
  );

  /* ────────────────────────────────────
     STEP 2 — Livraison
  ──────────────────────────────────── */
  const renderStep1 = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-heading font-semibold text-lg text-slate-800 mb-1">{tr.checkout.deliveryTitle}</h3>
        <p className="text-sm text-slate-500">{tr.checkout.deliveryQuestion}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={tr.auth.firstName} required error={errors.shippingAddress?.firstName?.message}>
          <input {...register('shippingAddress.firstName')} className={inputCls} placeholder="Jean" />
        </Field>
        <Field label={tr.auth.lastName} required error={errors.shippingAddress?.lastName?.message}>
          <input {...register('shippingAddress.lastName')} className={inputCls} placeholder="Dupont" />
        </Field>
      </div>

      <Field label={tr.checkout.company}>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input {...register('shippingAddress.company')} className={`${inputCls} pl-9`} placeholder="Cabinet Médical (optionnel)" />
        </div>
      </Field>

      <Field label={tr.checkout.streetAddress} required error={errors.shippingAddress?.address?.message}>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input {...register('shippingAddress.address')} className={`${inputCls} pl-9`} placeholder="12 rue de la Paix" />
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={tr.checkout.postalCode} required error={errors.shippingAddress?.postalCode?.message}>
          <input {...register('shippingAddress.postalCode')} className={inputCls} placeholder="75001" maxLength={5} />
        </Field>
        <Field label={tr.checkout.cityField} required error={errors.shippingAddress?.city?.message}>
          <input {...register('shippingAddress.city')} className={inputCls} placeholder="Paris" />
        </Field>
      </div>

      <Field label={tr.account.phone}>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input {...register('shippingAddress.phone')} type="tel" className={`${inputCls} pl-9`} placeholder="+33 6 12 34 56 78" />
        </div>
      </Field>

      {/* Same address checkbox */}
      <div className="pt-2 border-t border-slate-100">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0">
            <input
              type="checkbox"
              checked={sameAsShipping}
              onChange={e => setSameAsShipping(e.target.checked)}
              className="w-4 h-4 rounded accent-primary"
            />
          </div>
          <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
            {tr.checkout.sameBilling}
          </span>
        </label>
      </div>

      {!sameAsShipping && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 pt-2"
        >
          <h4 className="font-semibold text-slate-800">{tr.checkout.billingTitle}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={tr.auth.firstName}>
              <input {...register('billingAddress.firstName')} className={inputCls} placeholder="Jean" />
            </Field>
            <Field label={tr.auth.lastName}>
              <input {...register('billingAddress.lastName')} className={inputCls} placeholder="Dupont" />
            </Field>
          </div>
          <Field label={tr.checkout.streetAddress}>
            <input {...register('billingAddress.address')} className={inputCls} placeholder="Adresse de facturation" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={tr.checkout.postalCode}>
              <input {...register('billingAddress.postalCode')} className={inputCls} placeholder="75001" />
            </Field>
            <Field label={tr.checkout.cityField}>
              <input {...register('billingAddress.city')} className={inputCls} placeholder="Paris" />
            </Field>
          </div>
        </motion.div>
      )}

      <button
        type="button"
        onClick={() => setCurrentStep(3)}
        className="btn btn-primary btn-lg w-full justify-center mt-2"
      >
        {tr.checkout.continueToPayment}
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  /* ────────────────────────────────────
     STEP 2 — Paiement
  ──────────────────────────────────── */
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading font-semibold text-lg text-slate-800 mb-1">{tr.checkout.paymentMethodTitle}</h3>
        <p className="text-sm text-slate-500">{tr.checkout.paymentMethodDesc}</p>
      </div>

      {/* Payment options */}
      <div className="space-y-3">
        {([
          { value: 'card'    as const, icon: CreditCard, title: tr.checkout.cardOption,    desc: tr.checkout.cardOptionDesc },
          { value: 'transfer'as const, icon: Shield,     title: tr.checkout.transferOption, desc: tr.checkout.transferOptionDesc },
        ]).map(({ value, icon: Icon, title, desc }) => (
          <label
            key={value}
            onClick={() => setSelectedPayment(value)}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedPayment === value
                ? 'border-primary bg-primary-light'
                : 'border-slate-200 hover:border-primary/50'
            }`}
          >
            <input
              {...register('paymentMethod')}
              type="radio"
              value={value}
              className="w-4 h-4 accent-primary flex-shrink-0"
            />
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#e0f7f9' }}>
              <Icon className="w-5 h-5" style={{ color: '#00a8b5' }} />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{title}</p>
              <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Formulaire carte */}
      {selectedPayment === 'card' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4 p-5 rounded-xl border border-slate-200 bg-slate-50"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-slate-700">{tr.checkout.cardInfoTitle}</p>
            <div className="flex items-center gap-2">
              {['CB', 'VISA', 'MC'].map(b => (
                <span key={b} className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-300 bg-white text-slate-500">{b}</span>
              ))}
            </div>
          </div>

          <Field label={tr.checkout.cardNameField} required>
            <input
              {...register('cardName')}
              className={inputCls}
              placeholder="JEAN DUPONT"
              autoComplete="cc-name"
            />
          </Field>

          <Field label={tr.checkout.cardNumberField} required>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                {...register('cardNumber')}
                className={`${inputCls} pl-9 tracking-widest`}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                autoComplete="cc-number"
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                  e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
                }}
              />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={tr.checkout.cardExpiryField} required>
              <input
                {...register('cardExpiry')}
                className={inputCls}
                placeholder="MM/AA"
                maxLength={5}
                autoComplete="cc-exp"
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  e.target.value = v.length > 2 ? `${v.slice(0,2)}/${v.slice(2)}` : v;
                }}
              />
            </Field>
            <Field label={tr.checkout.cardCvvField} required>
              <div className="relative">
                <input
                  {...register('cardCvc')}
                  className={inputCls}
                  placeholder="123"
                  maxLength={4}
                  autoComplete="cc-csc"
                  type="password"
                />
              </div>
            </Field>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
            <Lock className="w-3.5 h-3.5 flex-shrink-0" />
            {tr.checkout.tlsNotice}
          </div>
        </motion.div>
      )}

      {/* Virement : infos */}
      {selectedPayment === 'transfer' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
        >
          <p className="text-sm font-semibold text-slate-700">{tr.checkout.transferInstructions}</p>
          <p className="text-xs text-slate-500">
            {tr.checkout.transferNote}
          </p>
        </motion.div>
      )}

      {/* Secure badges */}
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <p className="text-xs text-slate-500">
          {tr.checkout.paymentDataNotice}
        </p>
      </div>

      {/* CGV */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            {...register('terms')}
            type="checkbox"
            className="w-4 h-4 mt-0.5 accent-primary flex-shrink-0"
          />
          <span className="text-sm text-slate-600 leading-relaxed">
            {tr.checkout.agreeTermsPrefix}{' '}
            <a href="/legal/cgu" className="text-primary font-medium hover:underline">{tr.checkout.termsLink}</a>
            {' '}{tr.checkout.termsConnector}{' '}
            <a href="/legal/privacy" className="text-primary font-medium hover:underline">{tr.checkout.privacyPolicyLink}</a>
          </span>
        </label>
        {errors.terms && <p className="mt-1 text-xs text-red-600">{errors.terms.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="btn btn-ghost btn-lg flex-shrink-0 border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          {tr.common.back}
        </button>

        <motion.button
          type="submit"
          disabled={isProcessing}
          whileHover={!isProcessing ? { scale: 1.02 } : {}}
          whileTap={!isProcessing ? { scale: 0.98 } : {}}
          className="btn btn-lg flex-1 justify-center"
          style={
            isProcessing
              ? { background: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed', border: 'none' }
              : {
                  background: 'linear-gradient(135deg, #00a8b5 0%, #0098a4 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px 0 rgba(0,168,181,.3)',
                  border: 'none',
                }
          }
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              {tr.checkout.processing}
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              {tr.checkout.finalize}
            </>
          )}
        </motion.button>
      </div>
    </div>
  );

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
              <h1 className="hidden sm:block font-heading font-bold text-lg text-slate-800">{tr.checkout.pageTitle}</h1>
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
              const done    = currentStep > step.id;
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
                      style={{ color: current ? '#00a8b5' : done ? '#0f172a' : '#94a3b8' }}
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
              <form onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    {currentStep === 1 && renderAuthStep()}
                    {currentStep === 2 && renderStep1()}
                    {currentStep === 3 && renderStep2()}
                  </motion.div>
                </AnimatePresence>
              </form>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100" style={{ background: '#f8fafc' }}>
                <h3 className="font-heading font-semibold text-slate-800">
                  {tr.checkout.summaryTitle} ({items.length})
                </h3>
              </div>

              {/* Items */}
              <div className="px-6 py-4 space-y-4 max-h-64 overflow-y-auto">
                {items.map(item => {
                  const price = (item.selectedVariant?.price ?? item.product.price) * item.quantity;
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
                        {item.product.images?.[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{item.product.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{tr.checkout.qtyLabel} {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 flex-shrink-0">{formatPrice(price)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="px-6 py-4 border-t border-slate-100 space-y-2.5">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{tr.checkout.subtotalHT}</span>
                  <span>{formatPrice(totalHT)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{tr.common.shipping}</span>
                  <span className={shippingCost === 0 ? 'text-emerald-600 font-medium' : ''}>
                    {shippingCost === 0 ? tr.checkout.shippingFreeLabel : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{tr.checkout.taxLine}</span>
                  <span>{formatPrice(totalTVA)}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-heading font-bold text-slate-800">{tr.checkout.grandTotalLabel}</span>
                  <span className="font-heading font-bold text-xl text-slate-900">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Secure footer */}
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
