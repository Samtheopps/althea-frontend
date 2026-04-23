import type { AxiosError, AxiosResponse } from 'axios';
import apiService from './api';
import type { ApiResponse } from '@/types/api';
import type {
  Invoice,
  InvoiceListResponse,
  InvoicePagination,
  GetInvoicesParams,
} from '@/types/invoice';

// ──────────────────────────────────────────────────────────────
// Invoice service — listing, détail et téléchargement PDF
// Endpoints documentés dans INVOICE_FRONTOFFICE_GUIDE.md :
//   GET  /users/me/invoices              (alias : /invoices/me)
//   GET  /invoices/:id
//   GET  /invoices/:id/pdf               (Bearer requis, blob)
// ──────────────────────────────────────────────────────────────

function unwrap<T>(res: AxiosResponse<ApiResponse<T>>): T {
  const body = res.data;
  if (!body) throw new Error('Réponse API vide');
  if (body.success === false) {
    throw new Error(body.message || body.error || "L'API a renvoyé une erreur");
  }
  if (body.data === undefined) {
    return undefined as unknown as T;
  }
  return body.data as T;
}

export function getInvoiceErrorMessage(err: unknown, fallback = 'Une erreur est survenue.'): string {
  const axiosErr = err as AxiosError<{
    error?: { code?: string; message?: string };
    code?: string;
    message?: string;
  }>;
  const backendMsg =
    axiosErr?.response?.data?.error?.message || axiosErr?.response?.data?.message;
  if (backendMsg) return backendMsg;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

function extractFilenameFromContentDisposition(header?: string): string | null {
  if (!header) return null;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1]);
    } catch {
      // ignore
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain?.[1] || null;
}

class InvoiceService {
  /**
   * Liste paginée des factures de l'utilisateur connecté.
   * Tente `/users/me/invoices` puis l'alias `/invoices/me`.
   */
  async getMyInvoices(params: GetInvoicesParams = {}): Promise<InvoiceListResponse> {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.status) qs.set('status', params.status);
    if (params.startDate) qs.set('startDate', params.startDate);
    if (params.endDate) qs.set('endDate', params.endDate);
    const query = qs.toString() ? `?${qs.toString()}` : '';

    const emptyResult: InvoiceListResponse = {
      data: [],
      pagination: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        total: 0,
        totalPages: 0,
      },
    };

    const endpoints = [`/users/me/invoices${query}`, `/invoices/me${query}`];

    let lastError: unknown = null;
    for (const url of endpoints) {
      try {
        const res = await apiService.get<unknown>(url);
        const body = res.data as {
          success?: boolean;
          data?: unknown;
          meta?: InvoicePagination;
          pagination?: InvoicePagination;
        };

        if (body?.success === false) {
          throw new Error('API returned success=false');
        }

        const rawData = body?.data;
        const rootMeta = body?.meta || body?.pagination;

        let list: Invoice[] = [];
        let nestedMeta: InvoicePagination | undefined;

        if (Array.isArray(rawData)) {
          list = rawData as Invoice[];
        } else if (rawData && typeof rawData === 'object') {
          const obj = rawData as {
            data?: Invoice[];
            invoices?: Invoice[];
            items?: Invoice[];
            results?: Invoice[];
            meta?: InvoicePagination;
            pagination?: InvoicePagination;
          };
          list = obj.data || obj.invoices || obj.items || obj.results || [];
          nestedMeta = obj.meta || obj.pagination;
        }

        const pagination =
          rootMeta ||
          nestedMeta || {
            page: params.page ?? 1,
            limit: params.limit ?? list.length,
            total: list.length,
            totalPages: list.length > 0 ? 1 : 0,
          };

        return { data: list, pagination };
      } catch (err) {
        const axiosErr = err as AxiosError;
        const status = axiosErr.response?.status;
        lastError = err;
        if (status === 404) continue;
        if (status === 400) return emptyResult;
        throw err;
      }
    }

    console.error('[invoices] No invoices endpoint worked, returning empty. Last error:', lastError);
    return emptyResult;
  }

  /**
   * Détail d'une facture (utilisateur propriétaire uniquement, 403 sinon).
   */
  async getInvoice(id: string): Promise<Invoice> {
    const res = await apiService.get<ApiResponse<Invoice>>(`/invoices/${id}`);
    return unwrap<Invoice>(res);
  }

  /**
   * Trouve la facture associée à une commande en parcourant les pages
   * de `/users/me/invoices` (la doc backend ne propose pas de filtre
   * direct par orderId).
   */
  async findInvoiceForOrder(orderId: string, maxPages = 5): Promise<Invoice | null> {
    const limit = 50;
    for (let page = 1; page <= maxPages; page++) {
      try {
        const { data, pagination } = await this.getMyInvoices({ page, limit });
        const match = data.find((inv) => inv.orderId === orderId);
        if (match) return match;
        if (page >= (pagination.totalPages || 1)) break;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Récupère le PDF d'une facture sous forme de Blob.
   * Idéal pour aperçu inline dans un iframe (Object URL).
   */
  async fetchPdfBlob(invoiceId: string): Promise<{ blob: Blob; filename: string | null }> {
    const res = await apiService.get<Blob>(`/invoices/${invoiceId}/pdf`, {
      responseType: 'blob',
    });
    const blob =
      res.data instanceof Blob
        ? res.data
        : new Blob([res.data as BlobPart], { type: 'application/pdf' });
    const filename = extractFilenameFromContentDisposition(
      res.headers?.['content-disposition'] as string | undefined,
    );
    return { blob, filename };
  }

  /**
   * Télécharge le PDF d'une facture (déclenche un download navigateur).
   */
  async downloadPdf(invoice: Pick<Invoice, 'id' | 'invoiceNumber'>): Promise<void> {
    const { blob, filename } = await this.fetchPdfBlob(invoice.id);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `${invoice.invoiceNumber.toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const invoiceService = new InvoiceService();
export default invoiceService;
