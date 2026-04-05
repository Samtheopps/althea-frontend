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
      
      if (!data || !Array.isArray(data.products)) {
        console.warn('API produits: données invalides, utilisation du fallback');
        return this.getFallbackProducts(params);
      }
      
      return data;
    } catch (error: any) {
      // En cas d'erreur API, retourner systématiquement des données de fallback
      console.warn('API produits indisponible, utilisation des données de fallback:', apiService.handleApiError(error));
      
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
    console.info('Utilisation des données de fallback pour les produits');
    
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
      },
      {
        id: '3',
        name: 'Thermomètre Infrarouge Braun ThermoScan',
        slug: 'thermometre-braun-thermoscan',
        description: 'Thermomètre auriculaire professionnel avec technologie infrarouge de précision.',
        shortDescription: 'Thermomètre infrarouge professionnel',
        price: 89.99,
        originalPrice: 109.99,
        categoryId: '1',
        category: {
          id: '1',
          name: 'Diagnostic',
          slug: 'diagnostic',
          isActive: true
        },
        brand: 'Braun',
        images: [
          '/images/thermometre-1.jpg'
        ],
        stock: 30,
        rating: 4.7,
        reviewsCount: 95,
        isNew: true,
        discount: 18,
        features: [
          'Mesure en 1 seconde',
          'Technologie Age Precision',
          'Embouts jetables inclus',
          'Mémoire 9 mesures'
        ],
        specifications: {
          precision: '±0.2°C',
          display: 'LCD rétroéclairé',
          age_ranges: '0-3M, 3-36M, 36M+'
        },
        createdAt: '2024-03-01T10:00:00Z',
        updatedAt: '2024-03-01T10:00:00Z'
      },
      {
        id: '4',
        name: 'Oxymètre de pouls Nonin PalmSAT',
        slug: 'oxymetre-nonin-palmsat',
        description: 'Oxymètre de pouls portable avec affichage numérique et courbe de pléthysmographie.',
        shortDescription: 'Oxymètre de pouls portable',
        price: 245.00,
        categoryId: '1',
        category: {
          id: '1',
          name: 'Diagnostic',
          slug: 'diagnostic',
          isActive: true
        },
        brand: 'Nonin',
        images: [
          '/images/oxymetre-1.jpg'
        ],
        stock: 12,
        rating: 4.9,
        reviewsCount: 67,
        isNew: false,
        features: [
          'Mesure SpO2 et fréquence cardiaque',
          'Affichage plethysmographique',
          'Batterie rechargeable',
          'Certification médicale'
        ],
        specifications: {
          accuracy_spo2: '±2%',
          accuracy_pulse: '±3 bpm',
          battery: 'Lithium rechargeable',
          weight: '142g'
        },
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z'
      }
    ];

    // Appliquer les filtres de base de manière sécurisée
    let filtered = [...fallbackProducts];
    
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm))
      );
    }

    if (params.category) {
      filtered = filtered.filter(product => product.categoryId === params.category);
    }

    if (params.priceMin !== undefined) {
      filtered = filtered.filter(product => product.price >= params.priceMin!);
    }

    if (params.priceMax !== undefined) {
      filtered = filtered.filter(product => product.price <= params.priceMax!);
    }

    if (params.brands && params.brands.length > 0) {
      filtered = filtered.filter(product => 
        product.brand && params.brands!.includes(product.brand)
      );
    }

    // Tri sécurisé
    if (params.sortBy) {
      switch (params.sortBy) {
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

    // Pagination sécurisée
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