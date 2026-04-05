import apiService from './api';
import { Product, Category, ApiResponse } from '@/types/api';

interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  priceMin?: number;
  priceMax?: number;
  brands?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest';
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export class ProductService {
  // Récupérer les produits avec filtrage et pagination
  async getProducts(params: GetProductsParams = {}): Promise<ProductsResponse> {
    try {
      // Construire les paramètres de requête
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.set('page', params.page.toString());
      if (params.limit) queryParams.set('limit', params.limit.toString());
      if (params.category) queryParams.set('category', params.category);
      if (params.search) queryParams.set('search', params.search);
      if (params.priceMin) queryParams.set('priceMin', params.priceMin.toString());
      if (params.priceMax) queryParams.set('priceMax', params.priceMax.toString());
      if (params.brands?.length) queryParams.set('brands', params.brands.join(','));
      if (params.sortBy) queryParams.set('sortBy', params.sortBy);
      
      const response = await apiService.get<ApiResponse<ProductsResponse>>(
        `/products?${queryParams.toString()}`
      );
      
      const data = response.data.data;
      
      if (!data) {
        return this.getFallbackProducts(params);
      }
      
      return data;
    } catch (error: any) {
      // En cas d'erreur API, retourner des données de fallback
      console.warn('Erreur lors du chargement des produits:', apiService.handleApiError(error));
      
      // Retourner des données de fallback pour le développement
      return this.getFallbackProducts(params);
    }
  }

  // Récupérer un produit par son slug
  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const response = await apiService.get<ApiResponse<Product>>(`/products/${slug}`);
      const product = response.data.data;
      
      return product || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      
      console.warn('Erreur lors du chargement du produit:', apiService.handleApiError(error));
      
      // Retourner un produit de fallback pour le développement
      return this.getFallbackProduct(slug);
    }
  }

  // Récupérer les catégories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiService.get<ApiResponse<Category[]>>('/categories');
      const categories = response.data.data;
      
      return categories || this.getFallbackCategories();
    } catch (error: any) {
      console.warn('Erreur lors du chargement des catégories:', apiService.handleApiError(error));
      
      // Retourner des catégories de fallback
      return this.getFallbackCategories();
    }
  }

  // Récupérer les produits similaires
  async getSimilarProducts(productId: string, limit: number = 4): Promise<Product[]> {
    try {
      const response = await apiService.get<ApiResponse<Product[]>>(
        `/products/${productId}/similar?limit=${limit}`
      );
      const products = response.data.data;
      
      return products || [];
    } catch (error: any) {
      console.warn('Erreur lors du chargement des produits similaires:', apiService.handleApiError(error));
      return [];
    }
  }

  // Récupérer les marques disponibles
  async getBrands(): Promise<string[]> {
    try {
      const response = await apiService.get<ApiResponse<string[]>>('/products/brands');
      const brands = response.data.data;
      
      return brands || ['Littmann', 'Omron', 'Beurer', 'Welch Allyn'];
    } catch (error: any) {
      console.warn('Erreur lors du chargement des marques:', apiService.handleApiError(error));
      return ['Littmann', 'Omron', 'Beurer', 'Welch Allyn'];
    }
  }

  // === DONNÉES DE FALLBACK POUR LE DÉVELOPPEMENT ===
  
  private getFallbackProducts(params: GetProductsParams): ProductsResponse {
    const fallbackProducts: Product[] = [
      {
        id: '1',
        name: 'Stéthoscope Littmann Classic III',
        slug: 'stethoscope-littmann-classic-iii',
        description: 'Stéthoscope acoustique de haute qualité pour professionnels de santé. Excellente acoustique et durabilité éprouvée.',
        shortDescription: 'Stéthoscope acoustique professionnel',
        price: 189.99,
        originalPrice: 229.99,
        categoryId: '1',
        category: {
          id: '1',
          name: 'Diagnostic',
          slug: 'diagnostic',
          isActive: true
        },
        brand: 'Littmann',
        images: [
          '/images/stethoscope-1.jpg',
          '/images/stethoscope-2.jpg'
        ],
        stock: 25,
        rating: 4.8,
        reviewsCount: 142,
        isNew: false,
        discount: 17,
        features: [
          'Pavillon double face haute performance',
          'Tubulure en caoutchouc sans latex',
          'Embouts auriculaires souples',
          'Garantie 7 ans'
        ],
        specifications: {
          weight: '185g',
          length: '69cm',
          warranty: '7 ans'
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Tensiomètre Omron M7 Intelli IT',
        slug: 'tensiometre-omron-m7-intelli-it',
        description: 'Tensiomètre électronique connecté avec validation clinique. Technologie Intelli Wrap Cuff pour un placement facile.',
        shortDescription: 'Tensiomètre électronique connecté',
        price: 159.99,
        categoryId: '1',
        category: {
          id: '1',
          name: 'Diagnostic',
          slug: 'diagnostic',
          isActive: true
        },
        brand: 'Omron',
        images: [
          '/images/tensiometre-1.jpg'
        ],
        stock: 15,
        rating: 4.6,
        reviewsCount: 89,
        isNew: true,
        features: [
          'Connexion Bluetooth',
          'Application Omron Connect',
          'Mémoire 2 utilisateurs',
          'Validation clinique ESH'
        ],
        specifications: {
          accuracy: '±3 mmHg',
          memory: '200 mesures',
          connectivity: 'Bluetooth'
        },
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-02-01T10:00:00Z'
      }
    ];

    // Appliquer les filtres de base
    let filtered = [...fallbackProducts];
    
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }

    if (params.category) {
      filtered = filtered.filter(product => product.categoryId === params.category);
    }

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 24;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filtered.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / limit)
    };
  }

  private getFallbackProduct(slug: string): Product | null {
    const products = this.getFallbackProducts({}).products;
    return products.find(p => p.slug === slug) || null;
  }

  private getFallbackCategories(): Category[] {
    return [
      {
        id: '1',
        name: 'Diagnostic',
        slug: 'diagnostic',
        description: 'Équipements de diagnostic médical',
        productCount: 45,
        isActive: true
      },
      {
        id: '2',
        name: 'Thérapie',
        slug: 'therapie',
        description: 'Équipements thérapeutiques',
        productCount: 32,
        isActive: true
      },
      {
        id: '3',
        name: 'Urgence',
        slug: 'urgence',
        description: 'Matériel d\'urgence et réanimation',
        productCount: 28,
        isActive: true
      }
    ];
  }
}

export const productService = new ProductService();