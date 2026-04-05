import apiService from './api';
import { Category, ApiResponse } from '@/types/api';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiService.get<ApiResponse<Category[]>>('/categories');
      const categories = response.data.data;
      
      if (!categories) {
        return this.getFallbackCategories();
      }
      
      return categories.filter(cat => cat.isActive);
    } catch (error: any) {
      console.warn('Erreur lors du chargement des catégories:', apiService.handleApiError(error));
      
      // Retourner des données de fallback
      return this.getFallbackCategories();
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
      
      console.warn('Erreur lors du chargement de la catégorie:', apiService.handleApiError(error));
      
      // Essayer de trouver dans les données de fallback
      const fallbackCategory = this.getFallbackCategories().find(cat => cat.id === id);
      if (fallbackCategory) {
        return fallbackCategory;
      }
      
      throw new Error('Catégorie non trouvée');
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
      
      console.warn('Erreur lors du chargement de la catégorie:', apiService.handleApiError(error));
      
      // Essayer de trouver dans les données de fallback
      const fallbackCategory = this.getFallbackCategories().find(cat => cat.slug === slug);
      if (fallbackCategory) {
        return fallbackCategory;
      }
      
      throw new Error('Catégorie non trouvée');
    }
  },

  async getMainCategories(): Promise<Category[]> {
    try {
      const response = await apiService.get<ApiResponse<Category[]>>('/categories/main');
      const categories = response.data.data;
      
      if (!categories) {
        return this.getFallbackCategories().filter(cat => !cat.parentId);
      }
      
      return categories.filter(cat => cat.isActive);
    } catch (error: any) {
      console.warn('Erreur lors du chargement des catégories principales:', apiService.handleApiError(error));
      
      // Retourner les catégories principales de fallback
      return this.getFallbackCategories().filter(cat => !cat.parentId);
    }
  },

  async getSubCategories(parentId: string): Promise<Category[]> {
    try {
      const response = await apiService.get<ApiResponse<Category[]>>(`/categories/${parentId}/children`);
      const categories = response.data.data;
      
      if (!categories) {
        return this.getFallbackCategories().filter(cat => cat.parentId === parentId);
      }
      
      return categories.filter(cat => cat.isActive);
    } catch (error: any) {
      console.warn('Erreur lors du chargement des sous-catégories:', apiService.handleApiError(error));
      
      // Retourner les sous-catégories de fallback
      return this.getFallbackCategories().filter(cat => cat.parentId === parentId);
    }
  },

  // Données de fallback pour le développement
  getFallbackCategories(): Category[] {
    return [
      {
        id: '1',
        name: 'Diagnostic',
        slug: 'diagnostic',
        description: 'Équipements de diagnostic médical',
        image: '/images/category-diagnostic.jpg',
        productCount: 45,
        parentId: null,
        isActive: true
      },
      {
        id: '2',
        name: 'Instruments chirurgicaux',
        slug: 'instruments-chirurgicaux',
        description: 'Instruments pour bloc opératoire',
        image: '/images/category-instruments.jpg',
        productCount: 128,
        parentId: null,
        isActive: true
      },
      {
        id: '3',
        name: 'Mobilier médical',
        slug: 'mobilier-medical',
        description: 'Tables d\'examen, fauteuils médicaux',
        image: '/images/category-mobilier.jpg',
        productCount: 67,
        parentId: null,
        isActive: true
      },
      {
        id: '4',
        name: 'Stérilisation',
        slug: 'sterilisation',
        description: 'Autoclaves et équipements de stérilisation',
        image: '/images/category-sterilisation.jpg',
        productCount: 23,
        parentId: null,
        isActive: true
      },
      {
        id: '5',
        name: 'Consommables',
        slug: 'consommables',
        description: 'Gants, masques, seringues',
        image: '/images/category-consommables.jpg',
        productCount: 234,
        parentId: null,
        isActive: true
      }
    ];
  }
};