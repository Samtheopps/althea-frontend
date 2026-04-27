'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Package,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Receipt,
} from 'lucide-react';
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

// Le backend peut renvoyer le montant d'une commande sous divers noms
const getOrderAmount = (order: Record<string, unknown>) =>
  (order.totalAmount ??
    order.total ??
    order.totalTtc ??
    order.grandTotal ??
    order.amount) as number | string | null | undefined;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export default function AccountPage() {
  const router = useRouter();
  const { tr } = useI18n();
  const { user, logout } = useAuthStore();

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  const loadRecent = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const { data } = await accountService.getOrders({ limit: 3, page: 1 });
      setRecentOrders(data);
    } catch (err) {
      // pas de toast ici : juste log, le dashboard reste utile
      console.warn('[account] getOrders (recent) failed:', getAccountErrorMessage(err));
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadRecent();
  }, [user, loadRecent]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Déconnecté'); //TODO i18n
      router.push('/');
    } catch {
      // logout tolerant : pas de toast erreur
    }
  };

  if (!user) return null;

  const shortcuts = [
    {
      id: 'orders',
      label: tr.nav.orders,
      desc: 'Suivre vos commandes', //TODO i18n
      icon: Package,
      href: '/account/orders',
    },
    {
      id: 'invoices',
      label: 'Mes factures', //TODO i18n
      desc: 'Consulter & télécharger vos factures', //TODO i18n
      icon: Receipt,
      href: '/account/invoices',
    },
    {
      id: 'addresses',
      label: tr.account.addresses,
      desc: 'Vos adresses de livraison', //TODO i18n
      icon: MapPin,
      href: '/account/addresses',
    },
    {
      id: 'payment',
      label: tr.account.payment,
      desc: 'Cartes enregistrées', //TODO i18n
      icon: CreditCard,
      href: '/account/payment',
    },
    {
      id: 'settings',
      label: tr.account.settings,
      desc: 'Informations & email', //TODO i18n
      icon: Settings,
      href: '/account/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
                style={{ background: '#00a8b5' }}
              >
                {(user.firstName?.[0] ?? '').toUpperCase()}
                {(user.lastName?.[0] ?? '').toUpperCase()}
              </div>
              <div>
                <h1 className="font-heading font-bold text-2xl text-slate-800">
                  <T>Bonjour</T>, {user.firstName}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto"
            >
              <LogOut className="w-4 h-4" />
              {tr.nav.logout}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Shortcut cards */}
        <section>
          <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">
            <T>Raccourcis</T>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {shortcuts.map((s, idx) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    href={s.href}
                    className="group block bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-primary hover:shadow-md transition-all duration-200"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                      style={{ background: '#e0f7f9' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: '#00a8b5' }} />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm mb-1"><T>{s.label}</T></h3>
                    <p className="text-xs text-slate-500 leading-relaxed"><T>{s.desc}</T></p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Recent orders */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              <T>Dernières commandes</T>
            </h2>
            <Link
              href="/account/orders"
              className="text-xs text-primary font-semibold hover:underline"
            >
              <T>Tout voir</T>
            </Link>
          </div>

          {loadingOrders ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-pulse"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-20 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                      <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <div
                className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: '#e0f7f9' }}
              >
                <Package className="w-7 h-7" style={{ color: '#00a8b5' }} />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">
                {tr.account.ordersEmpty}
              </h3>
              <Link
                href="/products"
                className="inline-block mt-3 text-xs font-semibold text-primary hover:underline"
              >
                <T>Découvrir nos produits</T>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const meta = STATUS_META[order.status] ?? STATUS_META.PENDING;
                const StatusIcon = meta.icon;
                return (
                  <Link
                    key={order.id}
                    href={`/account/orders/${order.id}`}
                    className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:border-primary transition-colors"
                  >
                    <span
                      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ color: meta.color, background: meta.bg }}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <T>{ORDER_STATUS_LABELS[order.status]}</T>
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {order.orderNumber || order.id}
                      </p>
                      <p className="text-xs text-slate-400">{fmtDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-slate-800 text-sm">
                        {fmt(getOrderAmount(order as unknown as Record<string, unknown>))} €
                      </p>
                      <p className="text-xs text-slate-400">
                        {tr.account.ordersArticles(order.items?.length ?? 0)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
