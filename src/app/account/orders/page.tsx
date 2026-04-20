'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, ArrowLeft, Search, Filter, ChevronDown,
  Download, MapPin, CreditCard, CheckCircle2, Clock, XCircle,
  Truck, RotateCcw, Calendar,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/lib/i18n';

/* ─────────────────────────────── types ─────────────────────────────── */

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

interface OrderItem {
  id: string;
  name: string;
  ref: string;
  qty: number;
  unitPrice: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  shipping: {
    firstName: string;
    lastName: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
  };
  payment: {
    method: 'card' | 'transfer';
    last4?: string;
    brand?: string;
  };
  total: number;
  shippingCost: number;
}

/* ──────────────────────────── mock data ────────────────────────────── */

const MOCK_ORDERS: Order[] = [
  {
    id: 'CMD-2026-0042',
    date: '2026-03-15T10:22:00Z',
    status: 'delivered',
    items: [
      { id: '1', name: 'Tensiomètre numérique pro', ref: 'TEN-PRO-001', qty: 2, unitPrice: 189.00 },
      { id: '2', name: 'Stéthoscope cardiologique', ref: 'STH-CAR-003', qty: 1, unitPrice: 245.00 },
    ],
    shipping: { firstName: 'Jean', lastName: 'Dupont', address: '12 rue de la Paix', postalCode: '75001', city: 'Paris', country: 'France' },
    payment: { method: 'card', last4: '4242', brand: 'Visa' },
    total: 623.00,
    shippingCost: 0,
  },
  {
    id: 'CMD-2026-0031',
    date: '2026-01-28T14:05:00Z',
    status: 'shipped',
    items: [
      { id: '3', name: 'Oxymètre de pouls', ref: 'OXY-001', qty: 3, unitPrice: 79.00 },
    ],
    shipping: { firstName: 'Jean', lastName: 'Dupont', address: '12 rue de la Paix', postalCode: '75001', city: 'Paris', country: 'France' },
    payment: { method: 'transfer' },
    total: 237.00,
    shippingCost: 12.00,
  },
  {
    id: 'CMD-2025-0178',
    date: '2025-11-04T09:15:00Z',
    status: 'delivered',
    items: [
      { id: '4', name: 'Glucomètre sans piqûre', ref: 'GLU-007', qty: 1, unitPrice: 320.00 },
      { id: '5', name: 'Lancettes (boîte 200)', ref: 'LAN-200', qty: 2, unitPrice: 18.50 },
    ],
    shipping: { firstName: 'Jean', lastName: 'Dupont', address: '12 rue de la Paix', postalCode: '75001', city: 'Paris', country: 'France' },
    payment: { method: 'card', last4: '8831', brand: 'Mastercard' },
    total: 357.00,
    shippingCost: 0,
  },
  {
    id: 'CMD-2025-0110',
    date: '2025-07-19T16:40:00Z',
    status: 'cancelled',
    items: [
      { id: '6', name: 'ECG portable 12 dérivations', ref: 'ECG-12D', qty: 1, unitPrice: 899.00 },
    ],
    shipping: { firstName: 'Jean', lastName: 'Dupont', address: '12 rue de la Paix', postalCode: '75001', city: 'Paris', country: 'France' },
    payment: { method: 'card', last4: '4242', brand: 'Visa' },
    total: 899.00,
    shippingCost: 0,
  },
  {
    id: 'CMD-2025-0055',
    date: '2025-03-02T11:30:00Z',
    status: 'returned',
    items: [
      { id: '7', name: 'Thermomètre frontal infrarouge', ref: 'THF-IR-02', qty: 1, unitPrice: 65.00 },
    ],
    shipping: { firstName: 'Jean', lastName: 'Dupont', address: '12 rue de la Paix', postalCode: '75001', city: 'Paris', country: 'France' },
    payment: { method: 'card', last4: '8831', brand: 'Mastercard' },
    total: 65.00,
    shippingCost: 5.90,
  },
];

/* ─────────────────────────── helpers ───────────────────────────────── */

const fmt = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
const getYear = (iso: string) => new Date(iso).getFullYear();

/* ═══════════════════════════ main page ═════════════════════════════ */

export default function AccountOrdersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { tr } = useI18n();

  const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    pending:    { label: tr.account.ordersStatusPending,    color: '#b45309', bg: '#fef3c7', icon: Clock },
    processing: { label: tr.account.ordersStatusProcessing, color: '#0369a1', bg: '#e0f2fe', icon: Package },
    shipped:    { label: tr.account.ordersStatusShipped,    color: '#6d28d9', bg: '#ede9fe', icon: Truck },
    delivered:  { label: tr.account.ordersStatusDelivered,  color: '#065f46', bg: '#d1fae5', icon: CheckCircle2 },
    cancelled:  { label: tr.account.ordersStatusCancelled,  color: '#991b1b', bg: '#fee2e2', icon: XCircle },
    returned:   { label: tr.account.ordersStatusReturned,   color: '#374151', bg: '#f3f4f6', icon: RotateCcw },
  };

  const [search, setSearch]             = useState('');
  const [filterYear, setFilterYear]     = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [showFilters, setShowFilters]   = useState(false);
  const [expandedId, setExpandedId]     = useState<string | null>(null);

  if (!user) { router.replace('/login'); return null; }

  const years = useMemo(
    () => [...new Set(MOCK_ORDERS.map(o => getYear(o.date)))].sort((a, b) => b - a),
    [],
  );

  const filtered = useMemo(() => {
    return MOCK_ORDERS.filter(o => {
      if (filterYear   !== 'all' && getYear(o.date) !== filterYear)   return false;
      if (filterStatus !== 'all' && o.status !== filterStatus)         return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          o.id.toLowerCase().includes(q) ||
          o.items.some(i => i.name.toLowerCase().includes(q) || i.ref.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [search, filterYear, filterStatus]);

  const grouped = useMemo(() => {
    const map: Record<number, Order[]> = {};
    for (const o of filtered) {
      const y = getYear(o.date);
      if (!map[y]) map[y] = [];
      map[y].push(o);
    }
    return Object.entries(map)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, orders]) => ({ year: Number(year), orders }));
  }, [filtered]);

  const handleDownload = (order: Order) => {
    toast.success(tr.account.ordersInvoiceGenerating(order.id), { duration: 3000 });
  };

  const inputCls = 'w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-primary focus:outline-none transition-all';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/account" className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-heading font-bold text-2xl text-slate-800">{tr.nav.orders}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{tr.account.ordersCount(MOCK_ORDERS.length)}</p>
            </div>
          </div>
        </div>

        {/* search + filters */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`${inputCls} pl-9`}
                placeholder={tr.account.ordersSearchPlaceholder}
              />
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                showFilters
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary'
              }`}
            >
              <Filter className="w-4 h-4" />
              {tr.account.ordersFiltersBtn}
              {(filterYear !== 'all' || filterStatus !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />{tr.account.ordersYear}
                    </label>
                    <select
                      value={filterYear}
                      onChange={e => setFilterYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      className={inputCls}
                    >
                      <option value="all">{tr.account.ordersAllYears}</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" />{tr.account.ordersStatusFilter}
                    </label>
                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value as OrderStatus | 'all')}
                      className={inputCls}
                    >
                      <option value="all">{tr.account.ordersAllStatuses}</option>
                      {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map(s => (
                        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {(filterYear !== 'all' || filterStatus !== 'all') && (
                  <button
                    onClick={() => { setFilterYear('all'); setFilterStatus('all'); }}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    {tr.account.ordersResetFilters}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* results */}
        {grouped.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#e0f7f9' }}>
              <Package className="w-8 h-8" style={{ color: '#00a8b5' }} />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">{tr.account.ordersNotFound}</h3>
            <p className="text-sm text-slate-500">{tr.account.ordersNotFoundDesc}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(({ year, orders }) => (
              <section key={year}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">{year}</span>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400">{tr.account.ordersCount(orders.length)}</span>
                </div>

                <div className="space-y-3">
                  {orders.map(order => {
                    const cfg = STATUS_CONFIG[order.status];
                    const StatusIcon = cfg.icon;
                    const isExpanded = expandedId === order.id;

                    return (
                      <motion.div
                        key={order.id}
                        layout
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : order.id)}
                          className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                        >
                          <span
                            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                            style={{ color: cfg.color, background: cfg.bg }}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {cfg.label}
                          </span>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm truncate">{order.id}</p>
                            <p className="text-xs text-slate-400">{fmtDate(order.date)}</p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-slate-800 text-sm">{fmt(order.total)} €</p>
                            <p className="text-xs text-slate-400">{tr.account.ordersArticles(order.items.length)}</p>
                          </div>

                          <div className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-slate-100 px-5 py-5 space-y-5">

                                {/* products */}
                                <div>
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{tr.account.ordersProducts}</h4>
                                  <div className="space-y-2">
                                    {order.items.map(item => (
                                      <div key={item.id} className="flex items-center justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                                          <p className="text-xs text-slate-400">{tr.account.ordersProducts} {tr.account.ordersRef ?? 'Réf'}: {item.ref} · {tr.account.ordersArticles(item.qty)}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700 flex-shrink-0">
                                          {fmt(item.qty * item.unitPrice)} €
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-1">
                                    <div className="flex justify-between text-xs text-slate-500">
                                      <span>{tr.account.ordersSubtotalHT}</span>
                                      <span>{fmt(order.total - order.shippingCost)} €</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500">
                                      <span>{tr.account.ordersShipping}</span>
                                      <span>{order.shippingCost === 0 ? tr.account.ordersFreeShipping : `${fmt(order.shippingCost)} €`}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold text-slate-800 pt-1">
                                      <span>{tr.account.ordersTotalTTC}</span>
                                      <span>{fmt(order.total)} €</span>
                                    </div>
                                  </div>
                                </div>

                                {/* address + payment */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="rounded-xl bg-slate-50 p-4">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                      <MapPin className="w-3.5 h-3.5" />{tr.account.ordersShippingAddress}
                                    </h4>
                                    <p className="text-sm font-medium text-slate-700">
                                      {order.shipping.firstName} {order.shipping.lastName}
                                    </p>
                                    <p className="text-xs text-slate-500">{order.shipping.address}</p>
                                    <p className="text-xs text-slate-500">
                                      {order.shipping.postalCode} {order.shipping.city}, {order.shipping.country}
                                    </p>
                                  </div>

                                  <div className="rounded-xl bg-slate-50 p-4">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                      <CreditCard className="w-3.5 h-3.5" />{tr.account.ordersPayment}
                                    </h4>
                                    {order.payment.method === 'card' ? (
                                      <>
                                        <p className="text-sm font-medium text-slate-700">{order.payment.brand}</p>
                                        <p className="text-xs text-slate-500">•••• •••• •••• {order.payment.last4}</p>
                                      </>
                                    ) : (
                                      <>
                                        <p className="text-sm font-medium text-slate-700">{tr.account.ordersBankTransfer}</p>
                                        <p className="text-xs text-slate-500">{tr.account.ordersBankTransferNote}</p>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* actions */}
                                <div className="flex items-center gap-3 pt-1">
                                  <button
                                    onClick={() => handleDownload(order)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                                  >
                                    <Download className="w-4 h-4" />
                                    {tr.account.ordersDownload}
                                  </button>
                                  {order.status === 'delivered' && (
                                    <Link
                                      href="/products"
                                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors"
                                      style={{ background: '#00a8b5' }}
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                      {tr.account.ordersReorder}
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
