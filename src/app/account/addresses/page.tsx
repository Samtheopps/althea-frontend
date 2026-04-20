'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2, Edit2, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/lib/i18n';

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

const EMPTY_ADDRESS: Omit<Address, 'id'> = {
  firstName: '', lastName: '', address: '', city: '',
  postalCode: '', country: 'France', phone: '',
};

export default function AccountAddressesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { tr } = useI18n();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState({ ...EMPTY_ADDRESS });

  if (!user) { router.replace('/login'); return null; }

  const inputCls = 'w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-primary focus:outline-none transition-all';

  const handleSave = () => {
    if (!form.firstName || !form.address || !form.city || !form.postalCode) {
      toast.error(tr.account.addressRequiredFields);
      return;
    }
    if (editing) {
      setAddresses(prev => prev.map(a => a.id === editing.id ? { ...a, ...form } : a));
      toast.success(tr.account.addressEdited);
    } else {
      setAddresses(prev => [...prev, { ...form, id: Date.now().toString(), isDefault: prev.length === 0 }]);
      toast.success(tr.account.addressAdded);
    }
    setShowForm(false);
    setEditing(null);
    setForm({ ...EMPTY_ADDRESS });
  };

  const handleEdit = (addr: Address) => {
    setEditing(addr);
    setForm({ firstName: addr.firstName, lastName: addr.lastName, address: addr.address,
      city: addr.city, postalCode: addr.postalCode, country: addr.country, phone: addr.phone });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    toast.success(tr.account.addressDeleted);
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
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
              <h1 className="font-heading font-bold text-2xl text-slate-800">{tr.account.addresses}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{tr.account.addressesCount(addresses.length)}</p>
            </div>
          </div>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm({ ...EMPTY_ADDRESS }); }}
            className="btn btn-primary gap-2">
            <Plus className="w-4 h-4" />
            {tr.account.addBtn}
          </button>
        </div>

        {addresses.length === 0 && !showForm && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#e0f7f9' }}>
              <MapPin className="w-8 h-8" style={{ color: '#00a8b5' }} />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">{tr.account.noAddresses}</h3>
            <p className="text-sm text-slate-500">{tr.account.noAddressesDesc}</p>
          </div>
        )}

        <div className="space-y-4">
          <AnimatePresence>
            {addresses.map(addr => (
              <motion.div key={addr.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#e0f7f9' }}>
                      <MapPin className="w-5 h-5" style={{ color: '#00a8b5' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-800 text-sm">{addr.firstName} {addr.lastName}</p>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#e0f7f9', color: '#00a8b5' }}>
                            {tr.account.defaultBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{addr.address}</p>
                      <p className="text-sm text-slate-600">{addr.postalCode} {addr.city}, {addr.country}</p>
                      {addr.phone && <p className="text-xs text-slate-400 mt-0.5">{addr.phone}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!addr.isDefault && (
                      <button onClick={() => handleSetDefault(addr.id)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-emerald-600"
                        title={tr.account.defaultBadge}>
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleEdit(addr)}
                      className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-primary">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(addr.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors text-slate-400 hover:text-red-500">
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
              <h3 className="font-semibold text-slate-800 mb-5">
                {editing ? tr.account.editAddressTitle : tr.account.newAddressTitle}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">{tr.auth.firstName} *</label>
                    <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className={inputCls} placeholder="Jean" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">{tr.auth.lastName} *</label>
                    <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className={inputCls} placeholder="Dupont" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">{tr.account.streetLabel} *</label>
                  <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inputCls} placeholder="12 rue de la Paix" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">{tr.account.postalLabel} *</label>
                    <input value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} className={inputCls} placeholder="75001" maxLength={5} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">{tr.account.cityLabel} *</label>
                    <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={inputCls} placeholder="Paris" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">{tr.account.phone}</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="+33 6 12 34 56 78" type="tel" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSave} className="btn btn-primary gap-2 flex-1 justify-center">
                    <Check className="w-4 h-4" />
                    {editing ? tr.common.save : tr.account.addAddressBtn}
                  </button>
                  <button onClick={() => { setShowForm(false); setEditing(null); }} className="btn btn-ghost border border-slate-200 px-5">
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
