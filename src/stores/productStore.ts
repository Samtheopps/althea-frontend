import { create } from 'zustand';
import { Product, Category } from '@/types/api';

interface ProductFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  brands?: string[];
  search?: string;
  inStock?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'availability';
}

interface ProductState {
  products: Product[];
  categories: Category[];
  filters: ProductFilters;
  loading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  
  // Actions
  setProducts: (products: Product[]) => void;
  setCategories: (categories: Category[]) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  
  // Getters
  getFilteredProducts: () => Product[];
  getBrands: () => string[];
}

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  categories: [],
  filters: {},
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 0,
  totalProducts: 0,

  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  
  setFilters: (newFilters) => {
    set({ 
      filters: { ...get().filters, ...newFilters },
      currentPage: 1 // Reset page when filters change
    });
  },
  
  resetFilters: () => {
    set({ 
      filters: {},
      currentPage: 1
    });
  },
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPage: (page) => set({ currentPage: page }),

  getFilteredProducts: () => {
    const { products, filters } = get();
    let filtered = [...(products || [])];

    // Filter by search — covers name, description, brand, features, applications, and technical specs
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product => {
        if (product.name.toLowerCase().includes(searchTerm)) return true;
        if (product.description?.toLowerCase().includes(searchTerm)) return true;
        if (product.shortDescription?.toLowerCase().includes(searchTerm)) return true;
        if (product.brand?.toLowerCase().includes(searchTerm)) return true;
        if (product.features?.some(f => f.toLowerCase().includes(searchTerm))) return true;
        if (product.applications?.some(a => a.toLowerCase().includes(searchTerm))) return true;
        if (product.technicalSpecs &&
            Object.values(product.technicalSpecs).some(v => String(v).toLowerCase().includes(searchTerm))) return true;
        if (product.specifications &&
            Object.values(product.specifications).some(v => String(v).toLowerCase().includes(searchTerm))) return true;
        return false;
      });
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(product => 
        product.categoryId === filters.category
      );
    }

    // Filter by price range
    if (filters.priceMin !== undefined) {
      filtered = filtered.filter(product => product.price >= filters.priceMin!);
    }
    if (filters.priceMax !== undefined) {
      filtered = filtered.filter(product => product.price <= filters.priceMax!);
    }

    // Filter by stock availability
    if (filters.inStock === true) {
      filtered = filtered.filter(product => product.stock === undefined || product.stock > 0);
    }

    // Filter by brands
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        filters.brands!.includes(product.brand || '')
      );
    }

    // Sort products
    // Par défaut : tri "availability" pour respecter la règle métier
    // (produits prioritaires d'abord, puis dispos, puis ruptures).
    const sortMode = filters.sortBy ?? 'availability';
    switch (sortMode) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case 'availability':
      default: {
        const isAvailable = (p: Product) =>
          p.stock === undefined || p.stock === null || p.stock > 0;
        filtered.sort((a, b) => {
          // 1) Produits prioritaires avant les autres
          const aP = a.isPriority ? 1 : 0;
          const bP = b.isPriority ? 1 : 0;
          if (aP !== bP) return bP - aP;

          // 2) Produits disponibles avant les ruptures
          const aA = isAvailable(a) ? 1 : 0;
          const bA = isAvailable(b) ? 1 : 0;
          if (aA !== bA) return bA - aA;

          // 3) Puis par displayOrder puis alphabétique
          const orderDiff = (a.displayOrder ?? 999) - (b.displayOrder ?? 999);
          if (orderDiff !== 0) return orderDiff;
          return a.name.localeCompare(b.name);
        });
        break;
      }
    }

    return filtered;
  },

  getBrands: () => {
    const { products } = get();
    const brands = (products || [])
      .map(product => product.brand)
      .filter(Boolean) as string[];
    return [...new Set(brands)].sort();
  },
}));