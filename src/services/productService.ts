import apiService from './api';
import { Product, Category, ApiResponse, ApiPaginatedResponse } from '@/types/api';
import { transformProductsResponse, transformApiProduct, transformApiCategory } from '@/utils/apiTransform';
import { errorHandler } from './errorHandler';
import { isValidId, validateNonEmptyString } from '@/utils/validation';

interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  priceMin?: number;
  priceMax?: number;
  brands?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'availability';
  inStock?: boolean;
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
      
      const url = `/products?${queryParams.toString()}`;
      
      const response = await apiService.get<ApiResponse<ApiPaginatedResponse<any>>>(url);
      
      // Vérifier la structure de réponse de l'API
      if (!response.data.success || !response.data.data) {
        throw new Error('Format de réponse API invalide - pas de success ou data');
      }
      
      const apiData = response.data.data;
      
      // Vérifier la structure paginée
      if (!apiData.data || !Array.isArray(apiData.data)) {
        throw new Error('Format de réponse API invalide - data.data n\'est pas un tableau');
      }
      
      if (!apiData.meta) {
        throw new Error('Format de réponse API invalide - meta de pagination manquant');
      }
      
      // Transformer les données vers le format attendu
      const transformedData = transformProductsResponse(apiData);
      
      return transformedData;
    } catch (error: any) {
      const errorDetails = errorHandler.handleError(error, 'Chargement des produits', false);
      throw new Error(errorDetails.message);
    }
  }

  // Récupérer un produit par son slug
  async getProductBySlug(slug: string): Promise<Product | null> {
    // Validation de slug
    if (!isValidId(slug, 'getProductBySlug')) {
      return null;
    }

    try {
      const response = await apiService.get<ApiResponse<any>>(`/products/${slug}`);
      
      if (!response.data.success || !response.data.data) {
        return null;
      }
      
      const transformedProduct = transformApiProduct(response.data.data);
      
      // Vérification supplémentaire que le produit transformé a un ID valide
      if (!isValidId(transformedProduct.id, 'getProductBySlug - produit transformé')) {
        console.error('Produit reçu sans ID valide:', transformedProduct);
        return null;
      }
      
      return transformedProduct;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      
      const errorDetails = errorHandler.handleError(error, `Chargement du produit ${slug}`, false);
      throw new Error(errorDetails.message);
    }
  }

  // Récupérer les catégories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiService.get<ApiResponse<any[]>>('/categories');
      
      if (!response.data.success || !response.data.data || !Array.isArray(response.data.data)) {
        throw new Error('Format de réponse API invalide');
      }
      
      // Transformer les catégories et filtrer uniquement les actives
      const transformedCategories = response.data.data
        .map(transformApiCategory)
        .filter(cat => cat.isActive);
      
      return transformedCategories;
    } catch (error: any) {
      const errorDetails = errorHandler.handleError(error, 'Chargement des catégories', false);
      throw new Error(errorDetails.message);
    }
  }

  // Récupérer les produits similaires
  async getSimilarProducts(productId: string, limit: number = 4): Promise<Product[]> {
    // Validation de productId
    if (!isValidId(productId, 'getSimilarProducts')) {
      return [];
    }

    try {
      const response = await apiService.get<ApiResponse<any[]>>(
        `/products/${productId}/similar?limit=${limit}`
      );
      
      if (!response.data.success || !response.data.data || !Array.isArray(response.data.data)) {
        return [];
      }
      
      const transformedProducts = response.data.data.map(transformApiProduct);
      return transformedProducts;
    } catch (error: any) {
      errorHandler.handleError(error, 'Chargement des produits similaires', false);
      return [];
    }
  }

  // Récupérer les marques disponibles
  async getBrands(): Promise<string[]> {
    try {
      const response = await apiService.get<ApiResponse<string[]>>('/products/brands');
      
      if (!response.data.success || !response.data.data || !Array.isArray(response.data.data)) {
        return [];
      }
      
      return response.data.data;
    } catch (error: any) {
      errorHandler.handleError(error, 'Chargement des marques', false);
      return [];
    }
  }
}

export const productService = new ProductService();