'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Trash2,
  Star,
  ArrowLeft,
  Lock,
  Loader2,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/lib/i18n';
import accountService, { getAccountErrorMessage } from '@/services/accountService';
import { T } from '@/components/ui/TranslatedText';
import { useTranslated } from '@/hooks/useTranslated';
import type { PaymentMethod } from '@/types/account';

/**
 * Mapping des brands de carte (Stripe renvoie en minuscules : "visa", "mastercard"…)
 */
const BRAND_LABELS: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
  discover: 'Discover',
  diners: 'Diners',
  jcb: 'JCB',
  unionpay: 'UnionPay',
  cb: 'CB',
};

const BRAND_COLORS: Record<string, string> = {
  visa: '#1a1f71',
  mastercard: '#eb001b',
  amex: '#2e77bc',
  cb: '#003d5c',
  default: '#003d5c',
};

function brandLabel(raw: string): string {
  return BRAND_LABELS[raw?.toLowerCase?.()] ?? raw?.toUpperCase?.() ?? 'Carte';
}
function brandColor(raw: string): string {
  return BRAND_COLORS[raw?.toLowerCase?.()] ?? BRAND_COLORS.default;
}

export default function AccountPaymentPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { tr } = useI18n();

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const setDefaultLabel = useTranslated('Définir par défaut');

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  const loadMethods = useCallback(async () => {
    try {
      setLoading(true);
      const data = await accountService.getPaymentMethods();
      setMethods(data);
    } catch (err) {
      toast.error(getAccountErrorMessage(err, 'Impossible de charger vos cartes.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadMethods();
  }, [user, loadMethods]);

  if (!user) return null;

  const handleDelete = async (id: string) => {
    try {
      setPendingId(id);
      await accountService.deletePaymentMethod(id);
      setMethods((prev) => prev.filter((m) => m.id !== id));
      toast.success(tr.account.cardDeleted);
    } catch (err) {
      toast.error(getAccountErrorMessage(err, 'Impossible de supprimer cette carte.'));
    } finally {
      setPendingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setPendingId(id);
      await accountService.setDefaultPaymentMethod(id);
      setMethods((prev) =>
        prev.map((m) => ({ ...m, isDefault: m.id === id })),
      );
      toast.success('Carte par défaut mise à jour'); //TODO i18n
    } catch (err) {
      toast.error(getAccountErrorMessage(err, 'Échec de la mise à jour.'));
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-heading font-bold text-2xl text-slate-800">
                {tr.account.payment}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {tr.account.paymentCount(methods.length)}
              </p>
            </div>
          </div>
        </div>

        {/* SSL notice */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100 mb-6">
          <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <p className="text-xs text-emerald-700">{tr.account.paymentSslNotice}</p>
        </div>

        {/* Info — pas d'ajout direct */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100 mb-6">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <T>{"Pour ajouter une carte, utilisez-la lors de votre prochain paiement et cochez « Enregistrer ce moyen de paiement ». Elle apparaîtra ici automatiquement."}</T>
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 rounded-lg bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && methods.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: '#e0f7f9' }}
            >
              <CreditCard className="w-8 h-8" style={{ color: '#00a8b5' }} />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">{tr.account.noCards}</h3>
            <p className="text-sm text-slate-500">{tr.account.noCardsDesc}</p>
          </div>
        )}

        {/* Liste */}
        {!loading && (
          <div className="space-y-4">
            <AnimatePresence>
              {methods.map((m) => {
                const isPending = pendingId === m.id;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className="w-12 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 uppercase tracking-wider"
                          style={{ background: brandColor(m.brand) }}
                        >
                          {brandLabel(m.brand)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-slate-800 text-sm font-mono">
                              •••• •••• •••• {m.last4}
                            </p>
                            {m.isDefault && (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: '#e0f7f9', color: '#00a8b5' }}
                              >
                                {tr.account.defaultBadge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {brandLabel(m.brand)} — <T>expire le</T>{' '}
                            {String(m.expMonth).padStart(2, '0')}/{m.expYear}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!m.isDefault && (
                          <button
                            onClick={() => handleSetDefault(m.id)}
                            disabled={isPending}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-500 transition-colors disabled:opacity-50"
                            title={setDefaultLabel}
                          >
                            {isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Star className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(m.id)}
                          disabled={isPending}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          aria-label="Supprimer"
                        >
                          {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
