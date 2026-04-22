// ──────────────────────────────────────────────────────────────
// Types — Flux checkout côté client (doc backend Althea)
// ──────────────────────────────────────────────────────────────

/* ── 1. Validate cart ───────────────────────────────────── */

export interface ValidationError {
  code: string;
  field?: string;
  message: string;
  productId?: string;
  productName?: string;
}

export interface ValidateResult {
  valid: boolean;
  errors: ValidationError[];
}

/* ── 2. Shipping options ───────────────────────────────── */

export interface ShippingOption {
  id: string;
  code: 'standard' | 'express' | 'premium' | string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  estimatedDays?: string;
  minDays?: number;
  maxDays?: number;
}

/* ── 3. Calculate total ────────────────────────────────── */

export interface CalculateTotalRequest {
  shippingMethodId?: string;
  couponCode?: string;
}

export interface TotalLine {
  label: string;
  amount: number;
}

export interface TotalBreakdown {
  subtotal: number;
  shipping: number;
  tax: number;
  discount?: number;
  total: number;
  currency?: string;
  couponApplied?: boolean;
  lines?: TotalLine[];
}

/* ── 4. Shipping session ───────────────────────────────── */

export interface CheckoutSession {
  id: string;
  sessionId?: string;
  expiresAt?: string;
  addressId?: string;
  shippingMethodId?: string;
  total?: number;
  totalAmount?: number; // nom utilisé par l'API Althea
  subtotal?: number;
  shipping?: number;
  shippingCost?: number;
  tax?: number;
  currency?: string;
}

/* ── 5. Payment intent ─────────────────────────────────── */

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency?: string;
}

/* ── 6. Confirm order ──────────────────────────────────── */

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  addressComplement?: string;
  postalCode: string;
  city: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount?: number;
  total: number;
  currency?: string;
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  shippingMethod?: {
    id: string;
    name: string;
    code?: string;
  };
  paymentIntentId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ConfirmResponse {
  order: Order;
}

/* ── Adresses utilisateur ──────────────────────────────── */
// Nouveau format backend : street / city / postalCode / country.
// Les champs firstName/lastName/address/company sont gardés optionnels
// pour la compatibilité avec l'ancien shape s'il revenait du backend.

export interface UserAddress {
  id: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  // Compat avec ancien format
  type?: 'billing' | 'shipping' | 'both';
  firstName?: string;
  lastName?: string;
  company?: string;
  address?: string;
  addressComplement?: string;
  phone?: string;
}
