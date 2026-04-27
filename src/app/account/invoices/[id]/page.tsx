'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Download,
  Loader2,
  Receipt,
  User as UserIcon,
  MapPin,
  Package,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import invoiceService, { getInvoiceErrorMessage } from '@/services/invoiceService';
import { T } from '@/components/ui/TranslatedText';
import {
  type Invoice,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_STYLES,
} from '@/types/invoice';

const fmtMoney = (n: number | string | null | undefined, currency = 'EUR') => {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  if (num == null || Number.isNaN(num)) return '—';
  return num.toLocaleString('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  });
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = (params?.id as string) || '';
  const { user } = useAuthStore();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  const loadInvoice = useCallback(async () => {
    if (!invoiceId) return;
    try {
      setLoading(true);
      const data = await invoiceService.getInvoice(invoiceId);
      setInvoice(data);
    } catch (err) {
      const e = err as { response?: { status?: number } };
      if (e.response?.status === 404 || e.response?.status === 403) {
        setNotFound(true);
      } else {
        toast.error(getInvoiceErrorMessage(err, 'Impossible de charger la facture.'));
      }
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    if (user && invoiceId) loadInvoice();
  }, [user, invoiceId, loadInvoice]);

  // Charger le PDF en blob pour l'aperçu inline
  useEffect(() => {
    if (!invoice) return;
    let objectUrl: string | null = null;
    let cancelled = false;

    (async () => {
      try {
        setPdfLoading(true);
        const { blob } = await invoiceService.fetchPdfBlob(invoice.id);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch {
        // Pas bloquant : l'utilisateur peut toujours télécharger via le bouton
        if (!cancelled) setPdfUrl(null);
      } finally {
        if (!cancelled) setPdfLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [invoice]);

  const handleDownload = async () => {
    if (!invoice || downloading) return;
    try {
      setDownloading(true);
      await invoiceService.downloadPdf(invoice);
    } catch (err) {
      toast.error(getInvoiceErrorMessage(err, 'Impossible de télécharger la facture.'));
    } finally {
      setDownloading(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-8 animate-pulse">
            <div className="w-9 h-9 rounded-lg bg-slate-200" />
            <div className="h-4 bg-slate-200 rounded w-40" />
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3">
            <div className="h-3 bg-slate-200 rounded w-1/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="h-64 bg-slate-100 rounded-xl mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="font-semibold text-slate-800 text-sm mb-2">
            <T>Facture introuvable</T>
          </h2>
          <Link
            href="/account/invoices"
            className="text-sm text-[#00a8b5] hover:underline"
          >
            <T>Retour à mes factures</T>
          </Link>
        </div>
      </div>
    );
  }

  const styles = INVOICE_STATUS_STYLES[invoice.status] || INVOICE_STATUS_STYLES.pending;
  const label = INVOICE_STATUS_LABELS[invoice.status] || invoice.status;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Back link */}
        <Link
          href="/account/invoices"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <T>Retour à mes factures</T>
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#e0f7f9' }}
            >
              <Receipt className="w-5 h-5" style={{ color: '#00a8b5' }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-800">{invoice.invoiceNumber}</h1>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ color: styles.color, background: styles.bg }}
                >
                  <T>{label}</T>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                <T>Émise le</T> {fmtDate(invoice.issuedAt)}
                {invoice.paidAt && (
                  <>
                    {' · '}
                    <T>Payée le</T> {fmtDate(invoice.paidAt)}
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
            style={{ background: '#00a8b5' }}
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <T>{downloading ? 'Téléchargement…' : 'Télécharger PDF'}</T>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Aperçu PDF */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="border-b border-slate-100 px-5 py-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <h2 className="font-semibold text-slate-800 text-sm">
                <T>Aperçu</T>
              </h2>
            </div>
            <div className="bg-slate-50" style={{ minHeight: '700px' }}>
              {pdfLoading ? (
                <div className="flex flex-col items-center justify-center h-[700px] gap-3">
                  <Loader2 className="w-6 h-6 text-[#00a8b5] animate-spin" />
                  <p className="text-xs text-slate-500">
                    <T>{"Génération de l'aperçu…"}</T>
                  </p>
                </div>
              ) : pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  title={`Facture ${invoice.invoiceNumber}`}
                  className="w-full"
                  style={{ height: '700px', border: 'none' }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[700px] gap-3 px-6">
                  <FileText className="w-10 h-10 text-slate-300" />
                  <p className="text-xs text-slate-500 text-center">
                    <T>{"Aperçu indisponible. Utilisez le bouton Télécharger PDF."}</T>
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Sidebar : infos */}
          <div className="space-y-4">
            {/* Totaux */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
            >
              <h3 className="font-semibold text-slate-800 text-sm mb-3">
                <T>Montants</T>
              </h3>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500"><T>Sous-total HT</T></dt>
                  <dd className="font-medium text-slate-700">
                    {fmtMoney(invoice.subtotalHt, invoice.currency)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500"><T>TVA</T></dt>
                  <dd className="font-medium text-slate-700">
                    {fmtMoney(invoice.totalVat, invoice.currency)}
                  </dd>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <dt className="font-semibold text-slate-800">
                    <T>Total TTC</T>
                  </dt>
                  <dd className="font-bold text-slate-800 text-sm">
                    {fmtMoney(invoice.totalTtc, invoice.currency)}
                  </dd>
                </div>
              </dl>
            </motion.div>

            {/* Client */}
            {invoice.customerSnapshot && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <h3 className="font-semibold text-slate-800 text-sm">
                    <T>Client</T>
                  </h3>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  {invoice.customerSnapshot.firstName} {invoice.customerSnapshot.lastName}
                </p>
                {invoice.customerSnapshot.email && (
                  <p className="text-xs text-slate-500 mt-1">
                    {invoice.customerSnapshot.email}
                  </p>
                )}
              </motion.div>
            )}

            {/* Adresse */}
            {invoice.billingAddressSnapshot && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <h3 className="font-semibold text-slate-800 text-sm">
                    <T>Adresse de facturation</T>
                  </h3>
                </div>
                <address className="text-xs text-slate-600 not-italic leading-relaxed">
                  {invoice.billingAddressSnapshot.address1}
                  {invoice.billingAddressSnapshot.address2 && (
                    <>
                      <br />
                      {invoice.billingAddressSnapshot.address2}
                    </>
                  )}
                  <br />
                  {invoice.billingAddressSnapshot.postalCode}{' '}
                  {invoice.billingAddressSnapshot.city}
                  {invoice.billingAddressSnapshot.country && (
                    <>
                      <br />
                      {invoice.billingAddressSnapshot.country}
                    </>
                  )}
                </address>
              </motion.div>
            )}

            {/* Lien commande */}
            {invoice.orderId && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  href={`/account/orders/${invoice.orderId}`}
                  className="flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-[#00a8b5] transition-colors"
                >
                  <Package className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">
                    <T>Voir la commande associée</T>
                  </span>
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {/* Items */}
        {invoice.items && invoice.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="border-b border-slate-100 px-5 py-3">
              <h3 className="font-semibold text-slate-800 text-sm">
                <T>Articles facturés</T>
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => (
                <div key={idx} className="px-5 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 truncate"><T>{item.productName}</T></p>
                    {item.variantName && (
                      <p className="text-xs text-slate-500 truncate"><T>{item.variantName}</T></p>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 w-10 text-right">×{item.quantity}</span>
                  <span className="text-xs text-slate-500 w-20 text-right">
                    <T>TVA</T> {(item.vatRate * 100).toFixed(0)}%
                  </span>
                  <span className="text-sm font-semibold text-slate-800 w-24 text-right">
                    {fmtMoney(
                      item.totalTtc ?? item.priceTtc * item.quantity,
                      invoice.currency,
                    )}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
