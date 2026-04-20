// Types pour l'API

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  company?: string;
  siret?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  // Prix réels de l'API
  priceHt: string;
  priceTtc: string;
  vatRate: string;
  // Champs calculés pour compatibilité
  price: number;
  originalPrice?: number;
  categoryId: string;
  category?: Category;
  // Champs de l'API
  technicalSpecs?: Record<string, any>;
  stock?: number;
  status: 'published' | 'draft' | 'archived';
  isPriority: boolean;
  isFeatured: boolean;
  displayOrder: number;
  mainImageRef?: string;
  // Images compatibles
  images?: string[]; // URLs pour compatibilité
  rawImages?: ProductImage[]; // Images brutes de l'API
  // Champs calculés pour compatibilité
  brand?: string;
  rating?: number;
  reviewsCount?: number;
  isNew?: boolean;
  discount?: number;
  features?: string[];
  applications?: string[];
  specifications?: Record<string, any>;
  dimensions?: string;
  weight?: string;
  certifications?: string[];
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageRef: string;
  displayOrder: number;
  isMain: boolean;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock?: number;
  sku?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageRef?: string | null;
  status: 'active' | 'inactive';
  displayOrder: number;
  productCount?: number;
  parentId?: string | null;
  // Champs calculés pour compatibilité
  image?: string;
  isActive: boolean;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod: 'card' | 'transfer';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: Address;
  billingAddress: Address;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Address {
  type: 'billing' | 'shipping';
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

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  helpful: number;
  createdAt: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

// Requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  company?: string;
}

// Responses
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Structure réelle de la pagination de l'API
export interface ApiPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiPaginatedResponse<T> {
  data: T[];
  meta: ApiPaginationMeta;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Search & Filter types
export interface ProductFilters {
  category?: string;
  search?: string;
  priceMin?: number;
  priceMax?: number;
  brands?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'rating';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  products: Product[];
  categories: Category[];
  total: number;
  query: string;
}

// Cart types
export interface CartItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  addedAt: string;
}