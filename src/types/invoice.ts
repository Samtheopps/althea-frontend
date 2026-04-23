// ──────────────────────────────────────────────────────────────
// Types — Invoices (factures)
// Reflète le contrat backend documenté dans INVOICE_FRONTOFFICE_GUIDE.md
// ──────────────────────────────────────────────────────────────

export type InvoiceStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

export interface InvoiceCustomerSnapshot {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface InvoiceAddressSnapshot {
  address1?: string;
  address2?: string;
  city?: string;
  postalCode?: string;
  region?: string;
  country?: string;
}

export interface InvoiceItem {
  productName: string;
  quantity: number;
  priceHt: number;
  priceTtc: number;
  vatRate: number;
  // Le backend peut éventuellement renvoyer ces champs — on les rend optionnels
  productId?: string;
  variantName?: string;
  totalHt?: number;
  totalTtc?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  userId?: string;
  status: InvoiceStatus;
  subtotalHt: number;
  totalVat: number;
  totalTtc: number;
  currency?: string;
  issuedAt: string;
  paidAt?: string | null;
  cancelledAt?: string | null;
  customerSnapshot?: InvoiceCustomerSnapshot;
  billingAddressSnapshot?: InvoiceAddressSnapshot;
  items?: InvoiceItem[];
}

export interface InvoicePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InvoiceListResponse {
  data: Invoice[];
  pagination: InvoicePagination;
}

export interface GetInvoicesParams {
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
  startDate?: string;
  endDate?: string;
}

/* ── Libellés FR + couleurs des statuts ──────────────────────── */

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  paid: 'Payée',
  pending: 'En attente',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

export const INVOICE_STATUS_STYLES: Record<
  InvoiceStatus,
  { color: string; bg: string }
> = {
  paid: { color: '#065f46', bg: '#d1fae5' },
  pending: { color: '#b45309', bg: '#fef3c7' },
  cancelled: { color: '#991b1b', bg: '#fee2e2' },
  refunded: { color: '#475569', bg: '#e2e8f0' },
};
