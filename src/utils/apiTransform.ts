/**
 * Utilitaires pour transformer les données de l'API vers le format attendu par l'application
 */

import { Product, Category, ProductImage } from '@/types/api';
import { isValidId } from '@/utils/validation';

/**
 * Transforme un produit de l'API vers le format attendu par l'application
 * Gère deux structures : 
 * - Produit direct (liste de produits)
 * - Structure imbriquée { product: {...}, images: [...] } (produit unique par slug)
 */
export function transformApiProduct(apiData: any): Product {
  // Détecter si c'est une structure imbriquée ou directe
  let apiProduct: any;
  let productImages: any[] = [];

  if (apiData.product && apiData.images) {
    // Structure imbriquée : { product: {...}, images: [...] }
    apiProduct = apiData.product;
    productImages = apiData.images;
  } else if (apiData.id) {
    // Structure directe : produit avec ses propriétés à la racine
    apiProduct = apiData;
    productImages = apiData.images || [];
  } else {
    console.error('transformApiProduct: structure de données non reconnue:', apiData);
    throw new Error('Structure de données produit invalide');
  }

  // Validation de l'ID
  if (!isValidId(apiProduct.id, 'transformApiProduct')) {
    console.error('transformApiProduct: produit sans ID reçu de l\'API:', apiProduct);
    throw new Error('Produit reçu sans ID valide');
  }

  // Calculer le prix en nombre
  const price = parseFloat(apiProduct.priceTtc) || 0;
  const originalPrice = apiProduct.originalPrice ? parseFloat(apiProduct.originalPrice) : undefined;

  // Transformer les images en URLs (pour compatibilité)
  const images = productImages?.map((img: any) => 
    `https://api-pslt.matheovieilleville.fr/uploads/${img.imageRef}`
  ) || [];
  
  // Garder aussi les images brutes pour les besoins avancés
  const rawImages = productImages || [];

  // Calculer s'il y a une promotion
  const discount = originalPrice && originalPrice > price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : undefined;

  return {
    ...apiProduct,
    price,
    originalPrice,
    discount,
    isNew: apiProduct.isFeatured || false,
    images, // URLs string[] pour compatibilité
    rawImages, // ProductImage[] pour les besoins avancés
    // Compatibilité pour les champs manquants
    specifications: apiProduct.technicalSpecs || {},
    features: apiProduct.technicalSpecs 
      ? Object.entries(apiProduct.technicalSpecs).map(([key, value]) => `${key}: ${value}`)
      : [],
    // Transformer category si présente
    category: apiProduct.category ? transformApiCategory(apiProduct.category) : undefined,
    // Calculer isActive pour Category
    isActive: apiProduct.status === 'published'
  };
}

/**
 * Transforme une catégorie de l'API vers le format attendu par l'application
 */
export function transformApiCategory(apiCategory: any): Category {
  // Validation de l'ID
  if (!isValidId(apiCategory.id, 'transformApiCategory')) {
    console.error('transformApiCategory: catégorie sans ID reçue de l\'API:', apiCategory);
    throw new Error('Catégorie reçue sans ID valide');
  }

  // Construire l'URL de l'image si elle existe
  const image = apiCategory.imageRef 
    ? `https://api-pslt.matheovieilleville.fr/uploads/${apiCategory.imageRef}`
    : undefined;

  return {
    ...apiCategory,
    image,
    isActive: apiCategory.status === 'active'
  };
}

/**
 * Transforme la réponse paginée des produits
 */
export function transformProductsResponse(apiResponse: any) {
  const { data, meta } = apiResponse;
  
  return {
    products: data.map(transformApiProduct),
    total: meta.total,
    page: meta.page,
    totalPages: meta.totalPages
  };
}

/**
 * Génère l'URL complète pour une image
 */
export function getImageUrl(imageRef?: string | null): string | undefined {
  if (!imageRef) return undefined;
  return `https://api-pslt.matheovieilleville.fr/uploads/${imageRef}`;
}