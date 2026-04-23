// ──────────────────────────────────────────────────────────────
// Types — Account area (profile, addresses, payment methods, orders)
// ──────────────────────────────────────────────────────────────

/* ── User profile ─────────────────────────────────────────── */

export interface AccountUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateMePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateEmailPayload {
  email: string;
}

/* ── Addresses ────────────────────────────────────────────── */

export interface Address {
  id: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressPayload {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export type UpdateAddressPayload = Partial<CreateAddressPayload>;

/* ── Payment methods (Stripe) ─────────────────────────────── */

export interface PaymentMethod {
  id: string;                 // pm_xxx
  brand: string;              // visa, mastercard, amex…
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault?: boolean;
  createdAt?: string;
}

/* ── Orders ───────────────────────────────────────────────── */

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

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

export interface OrderShippingAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  // champs optionnels si le backend en renvoie davantage
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface OrderInvoiceRef {
  id: string;
  number?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: OrderShippingAddress;
  totalAmount: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  currency?: string;
  paymentStatus?: string;
  shippingMethod?: { id: string; name: string; code?: string };
  // La commande peut embarquer la référence de sa facture directement.
  invoice?: OrderInvoiceRef;
  invoiceId?: string;
  invoiceNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrdersListResponse {
  data: Order[];
  pagination: OrdersPagination;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}
