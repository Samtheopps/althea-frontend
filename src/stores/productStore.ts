import { create } from 'zustand';
import { Product, Category } from '@/types/api';

interface ProductFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  brands?: string[];
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest';
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

    // Filter by search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm)
      );
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

    // Filter by brands
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        filters.brands!.includes(product.brand || '')
      );
    }

    // Sort products
    if (filters.sortBy) {
      switch (filters.sortBy) {
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
          filtered.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
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