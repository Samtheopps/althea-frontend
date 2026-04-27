'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2, Edit2, ArrowLeft, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/lib/i18n';
import accountService, { getAccountErrorMessage } from '@/services/accountService';
import { T } from '@/components/ui/TranslatedText';
import type { Address, CreateAddressPayload } from '@/types/account';

const EMPTY_FORM: CreateAddressPayload = {
  street: '',
  city: '',
  postalCode: '',
  country: 'France',
  isDefault: false,
};

export default function AccountAddressesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { tr } = useI18n();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState<CreateAddressPayload>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ── Redirect si pas authentifié (dans effect, pas pendant render) ── */
  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  /* ── Fetch initial ── */
  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await accountService.getAddresses();
      setAddresses(data);
    } catch (err) {
      toast.error(getAccountErrorMessage(err, 'Impossible de charger vos adresses.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadAddresses();
  }, [user, loadAddresses]);

  if (!user) return null;

  const inputCls =
    'w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-primary focus:outline-none transition-all';

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
  };

  const handleSave = async () => {
    if (!form.street.trim() || !form.city.trim() || !form.postalCode.trim() || !form.country.trim()) {
      toast.error(tr.account.addressRequiredFields);
      return;
    }
    try {
      setSaving(true);
      if (editing) {
        const updated = await accountService.updateAddress(editing.id, form);
        setAddresses((prev) =>
          prev.map((a) => (a.id === editing.id ? { ...a, ...updated } : a)),
        );
        toast.success(tr.account.addressEdited);
      } else {
        const created = await accountService.createAddress(form);
        // Si la nouvelle est par défaut, repasser les autres à false
        setAddresses((prev) => {
          const next = created.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
          return [...next, created];
        });
        toast.success(tr.account.addressAdded);
      }
      resetForm();
    } catch (err) {
      toast.error(getAccountErrorMessage(err, "Échec de l'enregistrement."));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (addr: Address) => {
    setEditing(addr);
    setForm({
      street: addr.street,
      city: addr.city,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault ?? false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await accountService.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success(tr.account.addressDeleted);
    } catch (err) {
      toast.error(getAccountErrorMessage(err, 'Impossible de supprimer cette adresse.'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addr: Address) => {
    try {
      const updated = await accountService.updateAddress(addr.id, { isDefault: true });
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === updated.id })),
      );
      toast.success('Adresse par défaut mise à jour'); //TODO i18n
    } catch (err) {
      toast.error(getAccountErrorMessage(err, 'Échec de la mise à jour.'));
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
                {tr.account.addresses}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {tr.account.addressesCount(addresses.length)}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setForm({ ...EMPTY_FORM });
              setShowForm(true);
            }}
            className="btn btn-primary gap-2"
          >
            <Plus className="w-4 h-4" />
            {tr.account.addBtn}
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && addresses.length === 0 && !showForm && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: '#e0f7f9' }}
            >
              <MapPin className="w-8 h-8" style={{ color: '#00a8b5' }} />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">{tr.account.noAddresses}</h3>
            <p className="text-sm text-slate-500">{tr.account.noAddressesDesc}</p>
          </div>
        )}

        {/* Liste */}
        {!loading && (
          <div className="space-y-4">
            <AnimatePresence>
              {addresses.map((addr) => (
                <motion.div
                  key={addr.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#e0f7f9' }}
                      >
                        <MapPin className="w-5 h-5" style={{ color: '#00a8b5' }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-800 text-sm">{addr.street}</p>
                          {addr.isDefault && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: '#e0f7f9', color: '#00a8b5' }}
                            >
                              {tr.account.defaultBadge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          {addr.postalCode} {addr.city}
                        </p>
                        <p className="text-xs text-slate-500">{addr.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr)}
                          className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-emerald-600"
                          title={tr.account.defaultBadge}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(addr)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-primary"
                        aria-label="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        disabled={deletingId === addr.id}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors text-slate-400 hover:text-red-500 disabled:opacity-50"
                        aria-label="Supprimer"
                      >
                        {deletingId === addr.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
            >
              <h3 className="font-semibold text-slate-800 mb-5">
                {editing ? tr.account.editAddressTitle : tr.account.newAddressTitle}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {tr.account.streetLabel} *
                  </label>
                  <input
                    value={form.street}
                    onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                    className={inputCls}
                    placeholder="12 rue de la Paix"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      {tr.account.postalLabel} *
                    </label>
                    <input
                      value={form.postalCode}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, postalCode: e.target.value }))
                      }
                      className={inputCls}
                      placeholder="75001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      {tr.account.cityLabel} *
                    </label>
                    <input
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      className={inputCls}
                      placeholder="Paris"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    <T>Pays</T> *
                  </label>
                  <input
                    value={form.country}
                    onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                    className={inputCls}
                    placeholder="France"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!form.isDefault}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isDefault: e.target.checked }))
                    }
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-xs text-slate-600">
                    <T>Définir comme adresse par défaut</T>
                  </span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary gap-2 flex-1 justify-center disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {editing ? tr.common.save : tr.account.addAddressBtn}
                  </button>
                  <button
                    onClick={resetForm}
                    disabled={saving}
                    className="btn btn-ghost border border-slate-200 px-5"
                  >
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
