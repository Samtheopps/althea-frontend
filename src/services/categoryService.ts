import apiService from './api';
import { Category, ApiResponse } from '@/types/api';
import { errorHandler } from './errorHandler';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiService.get<ApiResponse<Category[]>>('/categories');
      const categories = response.data.data;
      
      if (!categories || !Array.isArray(categories)) {
        throw new Error('Format de réponse API invalide');
      }
      
      return categories.filter(cat => cat.isActive);
    } catch (error: any) {
      const errorDetails = errorHandler.handleError(error, 'Chargement des catégories', false);
      throw new Error(errorDetails.message);
    }
  },

  async getCategoryById(id: string): Promise<Category> {
    try {
      const response = await apiService.get<ApiResponse<Category>>(`/categories/${id}`);
      const category = response.data.data;
      
      if (!category) {
        throw new Error('Catégorie non trouvée');
      }
      
      return category;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Catégorie non trouvée');
      }
      
      const errorDetails = errorHandler.handleError(error, `Chargement de la catégorie ${id}`, false);
      throw new Error(errorDetails.message);
    }
  },

  async getCategoryBySlug(slug: string): Promise<Category> {
    try {
      const response = await apiService.get<ApiResponse<Category>>(`/categories/slug/${slug}`);
      const category = response.data.data;
      
      if (!category) {
        throw new Error('Catégorie non trouvée');
      }
      
      return category;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Catégorie non trouvée');
      }
      
      const errorDetails = errorHandler.handleError(error, `Chargement de la catégorie ${slug}`, false);
      throw new Error(errorDetails.message);
    }
  },

  async getMainCategories(): Promise<Category[]> {
    try {
      // Essayer d'abord l'endpoint spécifique main
      try {
        const response = await apiService.get<ApiResponse<Category[]>>('/categories/main');
        const categories = response.data.data;
        
        if (categories && Array.isArray(categories)) {
          return categories.filter(cat => cat.isActive);
        }
      } catch (mainEndpointError: any) {
        // Si l'endpoint principal n'existe pas (404), continuer avec le fallback
        if (mainEndpointError.response?.status !== 404) {
          throw mainEndpointError; // Re-lancer si ce n'est pas une 404
        }
        console.log('📂 Endpoint /categories/main non disponible, utilisation du fallback');
      }
      
      // Fallback : récupérer toutes les catégories et filtrer
      const allCategories = await this.getCategories();
      return allCategories.filter(cat => !cat.parentId);
      
    } catch (error: any) {
      console.warn('📂 Erreur lors du chargement des catégories principales, fallback vers liste vide');
      errorHandler.handleError(error, 'Chargement des catégories principales', false);
      
      // En cas d'échec total, retourner des catégories par défaut ou une liste vide
      return this.getDefaultMainCategories();
    }
  },

  // Fallback avec des catégories par défaut si l'API est complètement indisponible
  getDefaultMainCategories(): Category[] {
    const defaultCategories: Category[] = [
      {
        id: 'default-diagnostic',
        name: 'Instruments de Diagnostic',
        slug: 'instruments-diagnostic',
        description: 'Stéthoscopes, tensiomètres, thermomètres',
        imageRef: 'category-diagnostic.jpg',
        status: 'active' as const,
        displayOrder: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'default-consommables',
        name: 'Consommables',
        slug: 'consommables',
        description: 'Gants, seringues, matériel à usage unique',
        imageRef: 'category-consommables.jpg',
        status: 'active' as const,
        displayOrder: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'default-mobilier',
        name: 'Mobilier Médical',
        slug: 'mobilier',
        description: 'Tables d\'examen, fauteuils, chariots',
        imageRef: 'category-mobilier.jpg',
        status: 'active' as const,
        displayOrder: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    console.log('📂 Utilisation des catégories par défaut');
    return defaultCategories;
  },

  async getSubCategories(parentId: string): Promise<Category[]> {
    try {
      const response = await apiService.get<ApiResponse<Category[]>>(`/categories/${parentId}/children`);
      const categories = response.data.data;
      
      if (!categories || !Array.isArray(categories)) {
        return [];
      }
      
      return categories.filter(cat => cat.isActive);
    } catch (error: any) {
      errorHandler.handleError(error, 'Chargement des sous-catégories', false);
      return [];
    }
  }
};