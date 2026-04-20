'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Trash2, Star, ArrowLeft, Lock, Check } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/lib/i18n';

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  cardName: string;
  isDefault?: boolean;
}

const BRAND_COLORS: Record<string, string> = {
  Visa: '#1a1f71', Mastercard: '#eb001b', CB: '#003d5c',
};

export default function AccountPaymentPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { tr } = useI18n();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ cardName: '', cardNumber: '', expiry: '', cvc: '' });

  if (!user) { router.replace('/login'); return null; }

  const inputCls = 'w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-primary focus:outline-none transition-all';

  const handleAddCard = () => {
    const digits = form.cardNumber.replace(/\s/g, '');
    if (!form.cardName || digits.length < 16 || !form.expiry || form.cvc.length < 3) {
      toast.error(tr.account.invalidCard);
      return;
    }
    const [mm, yy] = form.expiry.split('/');
    const brand = digits.startsWith('4') ? 'Visa' : digits.startsWith('5') ? 'Mastercard' : 'CB';
    setMethods(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        last4: digits.slice(-4),
        brand,
        expMonth: parseInt(mm) || 1,
        expYear: 2000 + (parseInt(yy) || 0),
        cardName: form.cardName.toUpperCase(),
        isDefault: prev.length === 0,
      },
    ]);
    toast.success(tr.account.cardAdded);
    setShowForm(false);
    setForm({ cardName: '', cardNumber: '', expiry: '', cvc: '' });
  };

  const handleDelete = (id: string) => {
    setMethods(prev => prev.filter(m => m.id !== id));
    toast.success(tr.account.cardDeleted);
  };

  const handleSetDefault = (id: string) => {
    setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/account" className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-heading font-bold text-2xl text-slate-800">{tr.account.payment}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{tr.account.paymentCount(methods.length)}</p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)} className="btn btn-primary gap-2">
            <Plus className="w-4 h-4" />
            {tr.account.addBtn}
          </button>
        </div>

        {/* SSL notice */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100 mb-6">
          <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <p className="text-xs text-emerald-700">
            {tr.account.paymentSslNotice}
          </p>
        </div>

        {methods.length === 0 && !showForm && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#e0f7f9' }}>
              <CreditCard className="w-8 h-8" style={{ color: '#00a8b5' }} />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">{tr.account.noCards}</h3>
            <p className="text-sm text-slate-500">{tr.account.noCardsDesc}</p>
          </div>
        )}

        <div className="space-y-4">
          <AnimatePresence>
            {methods.map(m => (
              <motion.div key={m.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: BRAND_COLORS[m.brand] ?? '#003d5c' }}>
                      {m.brand}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800 text-sm">•••• •••• •••• {m.last4}</p>
                        {m.isDefault && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#e0f7f9', color: '#00a8b5' }}>
                            {tr.account.defaultBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{m.cardName} — {String(m.expMonth).padStart(2,'0')}/{m.expYear}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!m.isDefault && (
                      <button onClick={() => handleSetDefault(m.id)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-500 transition-colors"
                        title={tr.account.defaultBadge}>
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(m.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
              className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
            >
              <h3 className="font-semibold text-slate-800 mb-5">{tr.account.newCard}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">{tr.account.cardNameLabel}</label>
                  <input value={form.cardName} onChange={e => setForm(f => ({ ...f, cardName: e.target.value }))}
                    className={inputCls} placeholder="JEAN DUPONT" autoComplete="cc-name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">{tr.account.cardNumberLabel}</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      value={form.cardNumber}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                        setForm(f => ({ ...f, cardNumber: v.replace(/(.{4})/g, '$1 ').trim() }));
                      }}
                      className={`${inputCls} pl-9 tracking-widest`}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      autoComplete="cc-number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">{tr.account.cardExpiryLabel}</label>
                    <input
                      value={form.expiry}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setForm(f => ({ ...f, expiry: v.length > 2 ? `${v.slice(0,2)}/${v.slice(2)}` : v }));
                      }}
                      className={inputCls} placeholder="MM/AA" maxLength={5} autoComplete="cc-exp" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">{tr.account.cardCvvLabel}</label>
                    <input value={form.cvc} onChange={e => setForm(f => ({ ...f, cvc: e.target.value.replace(/\D/g,'').slice(0,4) }))}
                      className={inputCls} placeholder="123" maxLength={4} type="password" autoComplete="cc-csc" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleAddCard} className="btn btn-primary gap-2 flex-1 justify-center">
                    <Check className="w-4 h-4" />
                    {tr.account.addCardBtn}
                  </button>
                  <button onClick={() => setShowForm(false)} className="btn btn-ghost border border-slate-200 px-5">
                    {tr.common.cancel}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
