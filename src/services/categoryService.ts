import apiService from './api';
import { Category, ApiResponse, ApiPaginatedResponse } from '@/types/api';
import { errorHandler } from './errorHandler';
import { transformApiCategory } from '@/utils/apiTransform';

// Cache mémoire court (1 min) pour éviter de re-fetcher tous les produits
// à chaque appel de getCategories / getCategoryBySlug.
let productsCachePromise: Promise<any[]> | null = null;
let productsCacheTime = 0;
const PRODUCTS_CACHE_TTL_MS = 60_000;

async function fetchAllProducts(): Promise<any[]> {
  const now = Date.now();
  if (productsCachePromise && now - productsCacheTime < PRODUCTS_CACHE_TTL_MS) {
    return productsCachePromise;
  }
  productsCacheTime = now;
  productsCachePromise = apiService
    .get<ApiResponse<ApiPaginatedResponse<any>>>('/products?limit=500')
    .then((res) => res.data?.data?.data ?? [])
    .catch(() => []);
  return productsCachePromise;
}

// Dérive les catégories depuis les produits — on agrège par category.id,
// on compte les produits réels, et on trie par displayOrder puis par nom.
function deriveCategoriesFromProducts(products: any[]): Category[] {
  const map = new Map<string, Category>();
  for (const p of products) {
    const cat = p?.category;
    if (!cat?.id) continue;
    const existing = map.get(cat.id);
    if (existing) {
      existing.productCount = (existing.productCount ?? 0) + 1;
    } else {
      try {
        const transformed = transformApiCategory(cat);
        map.set(cat.id, { ...transformed, productCount: 1 });
      } catch {
        // catégorie invalide côté API, on skip
      }
    }
  }
  return Array.from(map.values())
    .filter((c) => c.isActive !== false)
    .sort((a, b) => {
      const orderDiff = (a.displayOrder ?? 999) - (b.displayOrder ?? 999);
      if (orderDiff !== 0) return orderDiff;
      return a.name.localeCompare(b.name);
    });
}

/**
 * Invalide le cache mémoire des produits utilisé pour dériver les catégories.
 * À appeler avant un refresh forcé (polling, pull-to-refresh…).
 */
export function invalidateCategoryCache() {
  productsCachePromise = null;
  productsCacheTime = 0;
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      // Source de vérité : les catégories RÉELLEMENT utilisées par les produits.
      // Ça garantit qu'aucune catégorie "fantôme" (sans produit) n'apparaît et
      // que chaque catégorie affichée contient bien des produits associés.
      const products = await fetchAllProducts();
      const derived = deriveCategoriesFromProducts(products);
      if (derived.length > 0) return derived;

      // Fallback : l'endpoint /categories si on n'a pas pu dériver.
      const response = await apiService.get<ApiResponse<any[]>>('/categories');
      const categories = response.data?.data;
      if (!categories || !Array.isArray(categories)) {
        throw new Error('Format de réponse API invalide');
      }
      return categories.map(transformApiCategory).filter((cat) => cat.isActive);
    } catch (error: any) {
      const errorDetails = errorHandler.handleError(error, 'Chargement des catégories', false);
      throw new Error(errorDetails.message);
    }
  },

  async getCategoryById(id: string): Promise<Category> {
    try {
      // Priorité : dérivé depuis les produits (garantie de cohérence)
      const products = await fetchAllProducts();
      const derived = deriveCategoriesFromProducts(products);
      const found = derived.find((c) => c.id === id);
      if (found) return found;

      const response = await apiService.get<ApiResponse<any>>(`/categories/${id}`);
      const category = response.data?.data;
      if (!category) throw new Error('Catégorie non trouvée');
      return transformApiCategory(category);
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
      // Priorité : dérivé depuis les produits — même logique
      const products = await fetchAllProducts();
      const derived = deriveCategoriesFromProducts(products);
      const found = derived.find((c) => c.slug === slug || c.id === slug);
      if (found) return found;

      const response = await apiService.get<ApiResponse<any>>(`/categories/${slug}`);
      const payload = response.data?.data;
      const rawCategory = payload?.category ?? payload;
      if (!rawCategory) throw new Error('Catégorie non trouvée');
      return transformApiCategory(rawCategory);
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
      const response = await apiService.get<ApiResponse<any[]>>(`/categories/${parentId}/children`);
      const categories = response.data.data;

      if (!categories || !Array.isArray(categories)) {
        return [];
      }

      return categories.map(transformApiCategory).filter(cat => cat.isActive);
    } catch (error: any) {
      errorHandler.handleError(error, 'Chargement des sous-catégories', false);
      return [];
    }
  }
};