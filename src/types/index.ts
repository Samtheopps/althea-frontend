// Types de base pour l'API Althea Systems
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  status: 'pending' | 'active' | 'inactive';
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  technicalSpecs?: Array<{ key: string; value: string }>;
  priceHt: string;
  vatRate: string;
  priceTtc: string;
  stock: number;
  status: 'published' | 'draft';
  isPriority: boolean;
  isFeatured: boolean;
  displayOrder: number;
  mainImageRef?: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageRef?: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  unitPriceHt: string;
  unitPriceTtc: string;
  createdAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotalHt: string;
  totalVat: string;
  totalTtc: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  stripePaymentMethodId: string;
  stripeCustomerId: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  cardholderName: string;
  isDefault: boolean;
  createdAt: string;
}

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Types pour l'authentification
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends ApiResponse<{
  user: User;
  accessToken: string;
  refreshToken: string;
}> {}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Types pour la navigation
export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType;
  children?: NavItem[];
}

// Types pour les erreurs
export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}