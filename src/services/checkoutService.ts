import type { AxiosError, AxiosResponse } from 'axios';
import apiService from './api';
import type { ApiResponse } from '@/types/api';
import type {
  ValidateResult,
  ShippingOption,
  CalculateTotalRequest,
  TotalBreakdown,
  CheckoutSession,
  PaymentIntentResult,
  Order,
  ConfirmResponse,
  UserAddress,
} from '@/types/checkout';

// ──────────────────────────────────────────────────────────────
// Checkout service — 7 étapes du flux backend Althea
// Toutes les réponses sont enveloppées dans { success, data }.
// ──────────────────────────────────────────────────────────────

function unwrap<T>(res: AxiosResponse<ApiResponse<T>>): T {
  const body = res.data;
  if (!body) {
    throw new Error('Réponse API vide');
  }
  if (body.success === false) {
    throw new Error(body.message || body.error || "L'API a renvoyé une erreur");
  }
  if (body.data === undefined) {
    // Cas particulier : certains endpoints renvoient { success, message } sans data
    return undefined as unknown as T;
  }
  return body.data as T;
}

// Normalise la forme du backend { isValid, issues } vers { valid, errors } utilisée
// par nos composants.
function normalizeValidateResult(raw: unknown): ValidateResult {
  if (!raw || typeof raw !== 'object') return { valid: false, errors: [] };
  const r = raw as Partial<ValidateResult> & {
    isValid?: boolean;
    issues?: Array<{ code?: string; field?: string; message?: string }>;
  };
  const valid = typeof r.valid === 'boolean' ? r.valid : r.isValid ?? false;
  const errors = r.errors ?? r.issues ?? [];
  return {
    valid,
    errors: errors.map((e) => ({
      code: e.code || 'UNKNOWN',
      field: e.field,
      message: e.message || '',
    })),
  };
}

class CheckoutService {
  /* ── 0. Sync panier local → backend via /cart/items ───── */
  // On pousse les items un par un (le backend fait +=quantity si déjà présent).
  // /cart/merge attend un anonymousCartId (UUID) qu'on n'a pas côté localStorage,
  // donc on passe par /cart/items qui est plus direct.
  async mergeAnonymousCart(
    items: Array<{ productId: string | number; quantity: number }>,
  ): Promise<void> {
    if (items.length === 0) return;

    for (const item of items) {
      try {
        await apiService.post('/cart/items', {
          productId: item.productId,
          quantity: item.quantity,
        });
      } catch (err) {
        const axiosErr = err as AxiosError<{ error?: { code?: string; message?: string }; message?: string }>;
        console.warn('[checkout] /cart/items failed for product:', item.productId, {
          status: axiosErr.response?.status,
          body: axiosErr.response?.data,
        });
        // On continue pour ajouter les autres items même si celui-ci échoue
      }
    }
  }

  /* ── 1. Validate cart ─────────────────────────────────── */
  async validateCart(): Promise<ValidateResult> {
    try {
      const res = await apiService.post<ApiResponse<ValidateResult>>('/checkout/validate', {});
      const data = unwrap<ValidateResult>(res);
      // Backend renvoie { isValid, issues } — on normalise vers { valid, errors }
      return normalizeValidateResult(data);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiResponse<ValidateResult>>;
      const body = axiosErr.response?.data;
      if (body && typeof body === 'object' && 'data' in body && body.data) {
        return normalizeValidateResult(body.data);
      }
      if (body && typeof body === 'object' && ('valid' in body || 'isValid' in body)) {
        return normalizeValidateResult(body as unknown as ValidateResult);
      }
      throw err;
    }
  }

  /* ── 2. Shipping options ──────────────────────────────── */
  async getShippingOptions(): Promise<ShippingOption[]> {
    const res = await apiService.get<ApiResponse<ShippingOption[] | { options: ShippingOption[] }>>(
      '/checkout/shipping-options',
    );
    const data = unwrap<ShippingOption[] | { options: ShippingOption[] }>(res);
    if (Array.isArray(data)) return data;
    if (data && 'options' in data && Array.isArray(data.options)) return data.options;
    return [];
  }

  /* ── 3. Calculate total ───────────────────────────────── */
  async calculateTotal(req: CalculateTotalRequest): Promise<TotalBreakdown> {
    const res = await apiService.post<ApiResponse<TotalBreakdown>>(
      '/checkout/calculate-total',
      req,
    );
    return unwrap<TotalBreakdown>(res);
  }

  /* ── 4. Shipping session ──────────────────────────────── */
  async createShippingSession(
    addressId: string,
    shippingMethodId: string, // "standard" | "express" | "premium" (minuscules)
  ): Promise<CheckoutSession> {
    const res = await apiService.post<ApiResponse<CheckoutSession>>('/checkout/shipping', {
      addressId,
      shippingMethodId,
    });
    return unwrap<CheckoutSession>(res);
  }

  /* ── 5. Payment intent — sessionId uniquement ─────────── */
  async createPaymentIntent(sessionId: string): Promise<PaymentIntentResult> {
    const res = await apiService.post<ApiResponse<PaymentIntentResult>>(
      '/checkout/payment-intent',
      { sessionId },
    );
    return unwrap<PaymentIntentResult>(res);
  }

  /* ── 7. Confirm order — synchrone, retourne l'order ──── */
  async confirmOrder(paymentIntentId: string, sessionId?: string): Promise<Order> {
    const body: Record<string, unknown> = { paymentIntentId };
    if (sessionId) body.sessionId = sessionId;

    const res = await apiService.post<ApiResponse<Order | ConfirmResponse>>(
      '/checkout/confirm',
      body,
    );

    const data = unwrap<Order | ConfirmResponse>(res);
    if (data && typeof data === 'object' && 'order' in data && data.order) {
      return (data as ConfirmResponse).order;
    }
    return data as Order;
  }

  /* ── Bonus : récupérer une commande après création ────── */
  async getOrder(orderId: string): Promise<Order> {
    const res = await apiService.get<ApiResponse<Order>>(`/orders/${orderId}`);
    return unwrap<Order>(res);
  }

  /* ── Bonus : adresses de l'utilisateur ────────────────── */
  async getUserAddresses(): Promise<UserAddress[]> {
    try {
      const res = await apiService.get<ApiResponse<UserAddress[] | { addresses: UserAddress[] }>>(
        '/users/me/addresses',
      );
      const data = unwrap<UserAddress[] | { addresses: UserAddress[] }>(res);
      if (Array.isArray(data)) return data;
      if (data && 'addresses' in data && Array.isArray(data.addresses)) return data.addresses;
      return [];
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 404) return [];
      throw err;
    }
  }
}

// ──────────────────────────────────────────────────────────────
// Mapping des codes d'erreur backend → messages FR lisibles
// ──────────────────────────────────────────────────────────────
export const CHECKOUT_ERROR_MESSAGES: Record<string, string> = {
  CART_EMPTY: 'Votre panier est vide.',
  CART_INVALID: "Votre panier contient des éléments invalides. Merci de le vérifier.",
  OUT_OF_STOCK: "Un produit de votre panier n'est plus en stock.",
  INSUFFICIENT_STOCK: 'Stock insuffisant pour un des produits du panier.',
  ADDRESS_NOT_FOUND: "L'adresse sélectionnée est introuvable.",
  ADDRESS_INVALID: "L'adresse de livraison est invalide.",
  SHIPPING_METHOD_NOT_FOUND: "Le mode de livraison choisi n'existe plus.",
  SHIPPING_METHOD_INVALID: "Le mode de livraison sélectionné est invalide.",
  SESSION_NOT_FOUND: 'Votre session de paiement a expiré. Merci de recommencer.',
  SESSION_EXPIRED: 'Votre session de paiement a expiré. Merci de recommencer.',
  PAYMENT_INTENT_FAILED: 'Impossible de préparer le paiement. Réessayez dans un instant.',
  PAYMENT_FAILED: 'Le paiement a échoué. Aucune somme n’a été débitée.',
  ORDER_NOT_READY: 'Votre commande est en cours de création…',
  UNAUTHORIZED: 'Vous devez être connecté pour finaliser la commande.',
};

export function getCheckoutErrorMessage(err: unknown, fallback = 'Une erreur est survenue.'): string {
  const axiosErr = err as AxiosError<{
    error?: { code?: string; message?: string; details?: unknown };
    code?: string;
    message?: string;
    errors?: Array<{ field?: string; message?: string }>;
  }>;
  const backendCode = axiosErr?.response?.data?.error?.code || axiosErr?.response?.data?.code;
  if (backendCode && CHECKOUT_ERROR_MESSAGES[backendCode]) {
    return CHECKOUT_ERROR_MESSAGES[backendCode];
  }
  const backendMsg =
    axiosErr?.response?.data?.error?.message || axiosErr?.response?.data?.message;
  if (backendMsg) return backendMsg;

  // Cas 400 avec liste d'erreurs de validation
  const validationErrors = axiosErr?.response?.data?.errors;
  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors.map((e) => e.message || e.field).filter(Boolean).join(' · ');
  }

  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export const checkoutService = new CheckoutService();
export default checkoutService;
