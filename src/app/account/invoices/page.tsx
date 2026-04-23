'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Download,
  Search,
  Loader2,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/authStore';
import invoiceService, { getInvoiceErrorMessage } from '@/services/invoiceService';
import {
  type Invoice,
  type InvoiceStatus,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_STYLES,
} from '@/types/invoice';

const STATUS_FILTERS: Array<{ value: InvoiceStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Toutes' },
  { value: 'paid', label: 'Payées' },
  { value: 'pending', label: 'En attente' },
  { value: 'cancelled', label: 'Annulées' },
  { value: 'refunded', label: 'Remboursées' },
];

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
    month: 'short',
    year: 'numeric',
  });

const PAGE_SIZE = 10;

export default function InvoicesPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: PAGE_SIZE,
        ...(statusFilter !== 'all' && { status: statusFilter }),
      };
      const { data, pagination } = await invoiceService.getMyInvoices(params);
      setInvoices(data);
      setTotalPages(pagination.totalPages || 1);
    } catch (err) {
      toast.error(getInvoiceErrorMessage(err, 'Impossible de charger vos factures.'));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    if (user) loadInvoices();
  }, [user, loadInvoices]);

  // Recherche client-side sur le numéro de facture
  const visibleInvoices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((inv) =>
      inv.invoiceNumber?.toLowerCase().includes(q),
    );
  }, [invoices, searchQuery]);

  const handleDownload = async (invoice: Invoice) => {
    if (downloadingId) return;
    try {
      setDownloadingId(invoice.id);
      await invoiceService.downloadPdf(invoice);
    } catch (err) {
      toast.error(getInvoiceErrorMessage(err, 'Impossible de télécharger la facture.'));
    } finally {
      setDownloadingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Back link */}
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {/* //TODO i18n */}Retour à mon compte
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: '#e0f7f9' }}
          >
            <Receipt className="w-5 h-5" style={{ color: '#00a8b5' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {/* //TODO i18n */}Mes factures
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {/* //TODO i18n */}Téléchargez ou consultez vos factures.
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par numéro de facture…" //TODO i18n
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a8b5]/20 focus:border-[#00a8b5] focus:bg-white transition-all"
              />
            </div>

            {/* Filtre statut */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
              {STATUS_FILTERS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setStatusFilter(opt.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    statusFilter === opt.value
                      ? 'bg-[#00a8b5] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                  </div>
                  <div className="h-7 w-20 rounded-lg bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleInvoices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div
              className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ background: '#e0f7f9' }}
            >
              <FileText className="w-7 h-7" style={{ color: '#00a8b5' }} />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm mb-1">
              {/* //TODO i18n */}
              {searchQuery || statusFilter !== 'all'
                ? 'Aucune facture ne correspond aux filtres.'
                : 'Aucune facture pour le moment.'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {/* //TODO i18n */}
              Les factures apparaîtront ici dès votre première commande payée.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleInvoices.map((inv, idx) => {
              const styles =
                INVOICE_STATUS_STYLES[inv.status] || INVOICE_STATUS_STYLES.pending;
              const label = INVOICE_STATUS_LABELS[inv.status] || inv.status;
              const isDownloading = downloadingId === inv.id;

              return (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 hover:border-[#00a8b5] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#e0f7f9' }}
                      >
                        <FileText className="w-5 h-5" style={{ color: '#00a8b5' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-800 text-sm truncate">
                            {inv.invoiceNumber}
                          </h3>
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ color: styles.color, background: styles.bg }}
                          >
                            {label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {fmtDate(inv.issuedAt)}
                          {inv.orderId && (
                            <>
                              {' · '}
                              <Link
                                href={`/account/orders/${inv.orderId}`}
                                className="hover:text-[#00a8b5] hover:underline"
                              >
                                {/* //TODO i18n */}Voir la commande
                              </Link>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 sm:flex-shrink-0">
                      <span className="text-sm font-bold text-slate-800">
                        {fmtMoney(inv.totalTtc, inv.currency)}
                      </span>
                      <Link
                        href={`/account/invoices/${inv.id}`}
                        className="text-xs font-semibold text-[#00a8b5] hover:underline whitespace-nowrap"
                      >
                        {/* //TODO i18n */}Détails
                      </Link>
                      <button
                        onClick={() => handleDownload(inv)}
                        disabled={isDownloading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ background: '#00a8b5' }}
                      >
                        {isDownloading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        PDF
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-[#00a8b5] hover:text-[#00a8b5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              {/* //TODO i18n */}Précédent
            </button>
            <span className="text-xs text-slate-500 px-3">
              {/* //TODO i18n */}Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-[#00a8b5] hover:text-[#00a8b5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {/* //TODO i18n */}Suivant
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
