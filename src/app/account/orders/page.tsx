'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ArrowLeft,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/lib/i18n';
import accountService, {
  getAccountErrorMessage,
  ORDER_STATUS_LABELS,
} from '@/services/accountService';
import type { Order, OrderStatus, OrdersPagination } from '@/types/account';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  PENDING: { label: ORDER_STATUS_LABELS.PENDING, color: '#b45309', bg: '#fef3c7', icon: Clock },
  PROCESSING: { label: ORDER_STATUS_LABELS.PROCESSING, color: '#0369a1', bg: '#e0f2fe', icon: Package },
  SHIPPED: { label: ORDER_STATUS_LABELS.SHIPPED, color: '#6d28d9', bg: '#ede9fe', icon: Truck },
  DELIVERED: { label: ORDER_STATUS_LABELS.DELIVERED, color: '#065f46', bg: '#d1fae5', icon: CheckCircle2 },
  CANCELLED: { label: ORDER_STATUS_LABELS.CANCELLED, color: '#991b1b', bg: '#fee2e2', icon: XCircle },
};

const ALL_STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const fmt = (n: number | string | null | undefined) => {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  if (num == null || Number.isNaN(num)) return '—';
  return num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Le backend peut renvoyer le montant sous divers noms selon les routes
const getOrderTotal = (order: Record<string, unknown>): number | string | null | undefined =>
  (order.totalAmount ??
    order.total ??
    order.totalTtc ??
    order.grandTotal ??
    order.amount) as number | string | null | undefined;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

export default function AccountOrdersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { tr } = useI18n();

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<OrdersPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  const loadOrders = useCallback(
    async (
      page: number,
      status: OrderStatus | 'all',
      opts: { silent?: boolean } = {},
    ) => {
      try {
        if (!opts.silent) setLoading(true);
        const { data, pagination: p } = await accountService.getOrders({
          page,
          limit: 10,
          status: status === 'all' ? undefined : status,
        });

        // Filtre côté client en fallback si le backend ignore le query param `status`.
        const filtered =
          status === 'all'
            ? data
            : data.filter(
                (o) => (o.status || '').toString().toUpperCase() === status,
              );

        setOrders(filtered);
        setPagination(p);
      } catch (err) {
        if (!opts.silent) {
          toast.error(getAccountErrorMessage(err, 'Impossible de charger vos commandes.'));
        }
      } finally {
        if (!opts.silent) setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (user) loadOrders(pagination.page, filterStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pagination.page, filterStatus]);

  // Polling temps réel — rafraîchit silencieusement toutes les 20s + au focus.
  useEffect(() => {
    if (!user) return;
    const tick = () => {
      if (document.visibilityState === 'visible') {
        loadOrders(pagination.page, filterStatus, { silent: true });
      }
    };
    const interval = window.setInterval(tick, 20000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadOrders(pagination.page, filterStatus, { silent: true });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onVisibility);
    };
  }, [user, pagination.page, filterStatus, loadOrders]);

  if (!user) return null;

  const handleFilterChange = (status: OrderStatus | 'all') => {
    setFilterStatus(status);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination((p) => ({ ...p, page }));
  };

  const inputCls =
    'w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-primary focus:outline-none transition-all';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
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
                {tr.nav.orders}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {tr.account.ordersCount(pagination.total)}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                showFilters
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary'
              }`}
            >
              <Filter className="w-4 h-4" />
              {tr.account.ordersFiltersBtn}
              {filterStatus !== 'all' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
            </button>
            {filterStatus !== 'all' && (
              <button
                onClick={() => handleFilterChange('all')}
                className="text-xs text-primary hover:underline self-center"
              >
                {tr.account.ordersResetFilters}
              </button>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    {tr.account.ordersStatusFilter}
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      handleFilterChange(e.target.value as OrderStatus | 'all')
                    }
                    className={inputCls}
                  >
                    <option value="all">{tr.account.ordersAllStatuses}</option>
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_CONFIG[s].label}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="h-6 w-24 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                  </div>
                  <div className="h-3 bg-slate-200 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: '#e0f7f9' }}
            >
              <Package className="w-8 h-8" style={{ color: '#00a8b5' }} />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">{tr.account.ordersNotFound}</h3>
            <p className="text-sm text-slate-500">
              {filterStatus === 'all'
                ? tr.account.ordersEmpty
                : tr.account.ordersNotFoundDesc}
            </p>
          </div>
        )}

        {/* Liste */}
        {!loading && orders.length > 0 && (
          <>
            <div className="space-y-3">
              {orders.map((order) => {
                const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
                const StatusIcon = cfg.icon;
                const itemsCount = order.items?.length ?? 0;

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    <Link
                      href={`/account/orders/${order.id}`}
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
                        <p className="font-semibold text-slate-800 text-sm truncate">
                          {order.orderNumber || order.id}
                        </p>
                        <p className="text-xs text-slate-400">{fmtDate(order.createdAt)}</p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-slate-800 text-sm">
                          {fmt(getOrderTotal(order as unknown as Record<string, unknown>))} €
                        </p>
                        <p className="text-xs text-slate-400">
                          {tr.account.ordersArticles(itemsCount)}
                        </p>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Page précédente"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </button>
                <span className="text-sm text-slate-600 font-medium">
                  Page {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || loading}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Page suivante"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
