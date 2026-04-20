'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, MapPin, CreditCard, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import { useI18n } from '@/lib/i18n';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  number: string;
  date: string;
  items: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  shippingCost: number;
  grandTotal: number;
  paymentMethod: 'card' | 'transfer';
}

export default function ConfirmationPage() {
  const { tr } = useI18n();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('althea_last_order');
    if (!raw) {
      router.replace('/');
      return;
    }
    try {
      setOrder(JSON.parse(raw));
    } catch {
      router.replace('/');
    }
  }, [router]);

  if (!order) return null;

  const date = new Date(order.date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      {/* Logo */}
      <div className="flex justify-center mb-10">
        <Link href="/">
          <Logo size="lg" />
        </Link>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Success banner ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#e0f7f9' }}
          >
            <CheckCircle2 className="w-8 h-8" style={{ color: '#00a8b5' }} />
          </div>
          <h1 className="font-heading font-bold text-2xl text-slate-800 mb-1">
            {tr.checkout.confirmed}
          </h1>
          <p className="text-slate-500 text-sm mb-4">
            {tr.checkout.confirmedDesc}
          </p>
          <div
            className="inline-block px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: '#e0f7f9', color: '#007a85' }}
          >
            N° {order.number}
          </div>
          <p className="text-xs text-slate-400 mt-2">{date}</p>
        </div>

        {/* ── Items ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-slate-800 text-sm">{tr.checkout.orderedItems}</h2>
          </div>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-slate-700">
                  <span className="text-slate-400 mr-2">×{item.quantity}</span>
                  {item.name}
                </span>
                <span className="font-medium text-slate-800">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 mt-4 pt-4 space-y-1.5">
            <div className="flex justify-between text-sm text-slate-500">
              <span>{tr.checkout.subtotalHT}</span>
              <span>{formatPrice(order.totalHT)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>{tr.checkout.taxLine}</span>
              <span>{formatPrice(order.totalTVA)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>{tr.checkout.deliveryLabel}</span>
              <span>{order.shippingCost === 0 ? tr.checkout.shippingFreeLabel : formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-100">
              <span>{tr.checkout.grandTotalLabel}</span>
              <span style={{ color: '#00a8b5' }}>{formatPrice(order.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* ── Address + Payment ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-slate-400" />
              <h2 className="font-semibold text-slate-800 text-sm">{tr.checkout.deliveryLabel}</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
              {order.shippingAddress.address}<br />
              {order.shippingAddress.postalCode} {order.shippingAddress.city}<br />
              {order.shippingAddress.country}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-slate-400" />
              <h2 className="font-semibold text-slate-800 text-sm">{tr.checkout.paymentLabel}</h2>
            </div>
            <p className="text-sm text-slate-600">
              {order.paymentMethod === 'card' ? tr.checkout.bankCard : tr.checkout.bankTransfer}
            </p>
            {order.paymentMethod === 'transfer' && (
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {tr.checkout.bankTransferNote}
              </p>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/products"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {tr.checkout.continueShopping}
          </Link>
          <Link
            href="/account"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: '#00a8b5' }}
          >
            {tr.checkout.viewAccount}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-center text-xs text-slate-400 pb-4">
          {tr.checkout.contactNote}{' '}
          <a href="mailto:contact@altheasystems.fr" className="underline">
            contact@altheasystems.fr
          </a>
        </p>
      </div>
    </div>
  );
}
