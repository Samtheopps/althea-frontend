import type { AxiosError, AxiosResponse } from 'axios';
import apiService from './api';
import type { ApiResponse } from '@/types/api';
import type {
  AccountUser,
  UpdateMePayload,
  UpdateEmailPayload,
  Address,
  CreateAddressPayload,
  UpdateAddressPayload,
  PaymentMethod,
  Order,
  OrdersListResponse,
  GetOrdersParams,
  OrderStatus,
} from '@/types/account';

// ──────────────────────────────────────────────────────────────
// Account service — profil, adresses, cartes, commandes
// Toutes les réponses sont enveloppées dans { success, data }.
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

/**
 * Messages d'erreur FR lisibles à partir d'un AxiosError.
 */
export function getAccountErrorMessage(err: unknown, fallback = 'Une erreur est survenue.'): string {
  const axiosErr = err as AxiosError<{
    error?: { code?: string; message?: string };
    code?: string;
    message?: string;
    errors?: Array<{ field?: string; message?: string }>;
  }>;

  const backendMsg =
    axiosErr?.response?.data?.error?.message || axiosErr?.response?.data?.message;
  if (backendMsg) return backendMsg;

  const validationErrors = axiosErr?.response?.data?.errors;
  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors.map((e) => e.message || e.field).filter(Boolean).join(' · ');
  }

  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

class AccountService {
  /* ── Profil ──────────────────────────────────────────────── */

  async getMe(): Promise<AccountUser> {
    const res = await apiService.get<ApiResponse<AccountUser>>('/users/me');
    return unwrap<AccountUser>(res);
  }

  async updateMe(data: UpdateMePayload): Promise<AccountUser> {
    const res = await apiService.put<ApiResponse<AccountUser>>('/users/me', data);
    return unwrap<AccountUser>(res);
  }

  async updateEmail(payload: UpdateEmailPayload): Promise<void> {
    const res = await apiService.put<ApiResponse<void>>('/users/me/email', payload);
    unwrap<void>(res);
  }

  /* ── Adresses ────────────────────────────────────────────── */

  async getAddresses(): Promise<Address[]> {
    try {
      const res = await apiService.get<ApiResponse<Address[] | { addresses: Address[] }>>(
        '/users/me/addresses',
      );
      const data = unwrap<Address[] | { addresses: Address[] }>(res);
      if (Array.isArray(data)) return data;
      if (data && 'addresses' in data && Array.isArray(data.addresses)) return data.addresses;
      return [];
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 404) return [];
      throw err;
    }
  }

  async createAddress(data: CreateAddressPayload): Promise<Address> {
    const res = await apiService.post<ApiResponse<Address>>('/users/me/addresses', data);
    return unwrap<Address>(res);
  }

  async updateAddress(id: string, data: UpdateAddressPayload): Promise<Address> {
    const res = await apiService.put<ApiResponse<Address>>(`/users/me/addresses/${id}`, data);
    return unwrap<Address>(res);
  }

  async deleteAddress(id: string): Promise<void> {
    const res = await apiService.delete<ApiResponse<void>>(`/users/me/addresses/${id}`);
    unwrap<void>(res);
  }

  /* ── Moyens de paiement ──────────────────────────────────── */

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const res = await apiService.get<
        ApiResponse<PaymentMethod[] | { paymentMethods: PaymentMethod[] }>
      >('/users/me/payment-methods');
      const data = unwrap<PaymentMethod[] | { paymentMethods: PaymentMethod[] }>(res);
      if (Array.isArray(data)) return data;
      if (data && 'paymentMethods' in data && Array.isArray(data.paymentMethods)) {
        return data.paymentMethods;
      }
      return [];
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 404) return [];
      throw err;
    }
  }

  async deletePaymentMethod(id: string): Promise<void> {
    const res = await apiService.delete<ApiResponse<void>>(`/users/me/payment-methods/${id}`);
    unwrap<void>(res);
  }

  async setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
    const res = await apiService.put<ApiResponse<PaymentMethod>>(
      `/users/me/payment-methods/${id}/default`,
    );
    return unwrap<PaymentMethod>(res);
  }

  /* ── Commandes ───────────────────────────────────────────── */

  async getOrders(params: GetOrdersParams = {}): Promise<OrdersListResponse> {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.status) qs.set('status', params.status);
    const query = qs.toString() ? `?${qs.toString()}` : '';

    const emptyResult: OrdersListResponse = {
      data: [],
      pagination: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        total: 0,
        totalPages: 0,
      },
    };

    // On tente les deux endpoints que la doc liste : /users/me/orders puis /orders/me.
    const endpoints = [`/users/me/orders${query}`, `/orders/me${query}`];

    let lastError: unknown = null;
    for (const url of endpoints) {
      try {
        const res = await apiService.get<unknown>(url);
        console.log(`[account] ${url} raw response:`, res.data);

        // Le backend peut renvoyer la pagination au niveau racine (sibling de data)
        // ou dans data lui-même. On supporte les deux shapes.
        const body = res.data as {
          success?: boolean;
          data?: unknown;
          pagination?: OrdersListResponse['pagination'];
          meta?: OrdersListResponse['pagination'];
        };

        if (body?.success === false) {
          throw new Error('API returned success=false');
        }

        const rawData = body?.data;
        const rootPagination = body?.pagination || body?.meta;

        // Extraction de la liste — on essaie plusieurs formes
        let list: Order[] = [];
        let nestedPagination: OrdersListResponse['pagination'] | undefined;

        if (Array.isArray(rawData)) {
          list = rawData as Order[];
        } else if (rawData && typeof rawData === 'object') {
          const obj = rawData as {
            data?: Order[];
            orders?: Order[];
            items?: Order[];
            results?: Order[];
            pagination?: OrdersListResponse['pagination'];
            meta?: OrdersListResponse['pagination'];
          };
          list = obj.data || obj.orders || obj.items || obj.results || [];
          nestedPagination = obj.pagination || obj.meta;
        }

        const pagination =
          rootPagination ||
          nestedPagination || {
            page: params.page ?? 1,
            limit: params.limit ?? list.length,
            total: list.length,
            totalPages: list.length > 0 ? 1 : 0,
          };

        // Normalise les statuts à la source — le backend peut les renvoyer
        // en lowercase ou sous des alias (CONFIRMED, PAID…).
        const normalized = list.map((o) => ({
          ...o,
          status: normalizeOrderStatus(o.status),
        }));

        return { data: normalized, pagination };
      } catch (err) {
        const axiosErr = err as AxiosError<{ error?: { code?: string; message?: string }; message?: string }>;
        const status = axiosErr.response?.status;
        lastError = err;
        // 404 → l'endpoint n'existe pas à cette URL, on essaie le suivant
        if (status === 404) {
          console.warn(`[account] ${url} returned 404, trying next endpoint...`);
          continue;
        }
        // 400 → probablement pas de commande encore (bug backend qui renvoie 400 au lieu de [])
        if (status === 400) {
          console.warn(`[account] ${url} returned 400 — treating as empty list:`, {
            body: axiosErr.response?.data,
          });
          return emptyResult;
        }
        throw err;
      }
    }

    // Aucun endpoint n'a marché — on log et on retourne vide pour ne pas bloquer l'UI
    console.error('[account] No orders endpoint worked, returning empty. Last error:', lastError);
    return emptyResult;
  }

  async getOrder(id: string): Promise<Order> {
    const res = await apiService.get<ApiResponse<Order>>(`/orders/${id}`);
    const order = unwrap<Order>(res);
    return { ...order, status: normalizeOrderStatus(order.status) };
  }

  async cancelOrder(id: string): Promise<Order> {
    const res = await apiService.post<ApiResponse<Order>>(`/orders/${id}/cancel`, {});
    const order = unwrap<Order>(res);
    return { ...order, status: normalizeOrderStatus(order.status) };
  }

  /* ── Factures ────────────────────────────────────────────── */

  /**
   * Résout l'invoiceId pour une commande. On regarde d'abord les champs
   * potentiellement présents sur l'objet Order (invoice.id, invoiceId),
   * puis on tombe en fallback sur `GET /orders/:id/invoice`.
   */
  async getInvoiceIdForOrder(order: Order): Promise<{ id: string; number?: string }> {
    if (order.invoice?.id) return { id: order.invoice.id, number: order.invoice.number };
    if (order.invoiceId) return { id: order.invoiceId, number: order.invoiceNumber };

    // Fallback : tenter de récupérer la facture depuis le backend
    const res = await apiService.get<ApiResponse<{ id: string; number?: string } | { invoice: { id: string; number?: string } }>>(
      `/orders/${order.id}/invoice`,
    );
    const data = unwrap<{ id: string; number?: string } | { invoice: { id: string; number?: string } }>(res);
    if (data && typeof data === 'object' && 'invoice' in data && data.invoice) {
      return { id: data.invoice.id, number: data.invoice.number };
    }
    if (data && typeof data === 'object' && 'id' in data && typeof data.id === 'string') {
      return { id: data.id, number: (data as { number?: string }).number };
    }
    throw new Error('Facture introuvable pour cette commande.');
  }

  /**
   * Télécharge la facture PDF d'une commande.
   * Le backend expose `GET /invoices/:invoiceId/pdf` avec Bearer auth,
   * d'où le fetch en blob (impossible via un simple <a href>).
   */
  async downloadInvoicePdf(order: Order): Promise<void> {
    const { id: invoiceId, number } = await this.getInvoiceIdForOrder(order);

    const res = await apiService.get<Blob>(`/invoices/${invoiceId}/pdf`, {
      responseType: 'blob',
    });

    const blob = res.data instanceof Blob ? res.data : new Blob([res.data as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const filenameFromHeader = extractFilenameFromContentDisposition(
      res.headers?.['content-disposition'] as string | undefined,
    );
    const filename =
      filenameFromHeader ||
      `facture-${number || order.orderNumber || order.id}.pdf`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/** Extrait le filename d'un header Content-Disposition. */
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

/* ── Libellés FR des statuts de commande ──────────────────── */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'En attente',
  PROCESSING: 'En préparation',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};

/**
 * Le backend renvoie les statuts sous différentes casings / alias
 * (`processing`, `CONFIRMED`, `PAID`, `canceled`…). On normalise ici.
 */
export function normalizeOrderStatus(raw?: string | null): OrderStatus {
  const s = (raw || '').toString().toUpperCase().trim();
  if (
    s === 'PROCESSING' ||
    s === 'CONFIRMED' ||
    s === 'PAID' ||
    s === 'IN_PROGRESS' ||
    s === 'PREPARING'
  )
    return 'PROCESSING';
  if (s === 'SHIPPED' || s === 'IN_TRANSIT' || s === 'EN_ROUTE') return 'SHIPPED';
  if (s === 'DELIVERED' || s === 'COMPLETED' || s === 'FULFILLED') return 'DELIVERED';
  if (s === 'CANCELLED' || s === 'CANCELED' || s === 'REFUNDED') return 'CANCELLED';
  return 'PENDING';
}

export const accountService = new AccountService();
export default accountService;
