'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseImageWithFallbackOptions {
  src?: string | string[];
  fallbacks?: string[];
  categorySlug?: string;
  productName?: string;
}

interface ImageState {
  currentSrc: string;
  isLoading: boolean;
  hasError: boolean;
  isUsingFallback: boolean;
}

// Cache pour éviter de tester les mêmes images répétitivement
const imageLoadCache = new Map<string, { isValid: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useImageWithFallback({
  src,
  fallbacks = [],
  categorySlug,
  productName
}: UseImageWithFallbackOptions) {
  const [state, setState] = useState<ImageState>({
    currentSrc: '',
    isLoading: true,
    hasError: false,
    isUsingFallback: false
  });

  // Générer des fallbacks intelligents
  const generateFallbacks = useCallback((): string[] => {
    const smartFallbacks: string[] = [...fallbacks];

    // Images par catégorie
    if (categorySlug) {
      const categoryImages: Record<string, string> = {
        'instruments-diagnostic': '/images/category-diagnostic.jpg',
        'diagnostic': '/images/category-diagnostic.jpg',
        'consommables': '/images/category-consommables.jpg',
        'mobilier': '/images/category-mobilier.jpg',
        'sterilisation': '/images/category-sterilisation.jpg'
      };
      
      const categoryImage = categoryImages[categorySlug.toLowerCase()];
      if (categoryImage && !smartFallbacks.includes(categoryImage)) {
        smartFallbacks.push(categoryImage);
      }
    }

    // Images par type de produit
    if (productName) {
      const productLower = productName.toLowerCase();
      const productImages: Array<{ keywords: string[], image: string }> = [
        { keywords: ['stéthoscope', 'stethoscope'], image: '/images/stethoscope-1.jpg' },
        { keywords: ['thermomètre', 'thermometre'], image: '/images/thermometre-1.jpg' },
        { keywords: ['tensiomètre', 'tensiometre'], image: '/images/tensiometre-1.jpg' },
        { keywords: ['oxymètre', 'oxymetre'], image: '/images/oxymetre-1.jpg' }
      ];

      for (const { keywords, image } of productImages) {
        if (keywords.some(keyword => productLower.includes(keyword))) {
          if (!smartFallbacks.includes(image)) {
            smartFallbacks.push(image);
          }
          break;
        }
      }
    }

    // Image placeholder générique
    if (!smartFallbacks.includes('/placeholder-product.jpg')) {
      smartFallbacks.push('/placeholder-product.jpg');
    }

    return smartFallbacks;
  }, [fallbacks, categorySlug, productName]);

  // Vérifier si une image est en cache et valide
  const isCachedValid = (url: string): boolean => {
    const cached = imageLoadCache.get(url);
    if (!cached) return false;
    
    const now = Date.now();
    if (now - cached.timestamp > CACHE_DURATION) {
      imageLoadCache.delete(url);
      return false;
    }
    
    return cached.isValid;
  };

  // Marquer une image dans le cache
  const cacheImageResult = (url: string, isValid: boolean) => {
    imageLoadCache.set(url, {
      isValid,
      timestamp: Date.now()
    });
  };

  // Tester une image
  const testImage = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Vérifier le cache d'abord
      if (isCachedValid(url)) {
        resolve(imageLoadCache.get(url)!.isValid);
        return;
      }

      const img = new Image();
      
      const handleLoad = () => {
        cacheImageResult(url, true);
        resolve(true);
      };
      
      const handleError = () => {
        cacheImageResult(url, false);
        resolve(false);
      };

      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
      
      // Nettoyer les listeners après un timeout
      setTimeout(() => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
        if (!imageLoadCache.has(url)) {
          cacheImageResult(url, false);
          resolve(false);
        }
      }, 10000); // 10 secondes de timeout

      img.src = url;
    });
  };

  // Construire l'URL complète
  const getFullUrl = (imagePath: string): string => {
    if (!imagePath) return '';
    
    if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
      return imagePath;
    }
    
    // Utiliser l'URL de base de l'API
    return `https://api-pslt.matheovieilleville.fr/api/v1/media/${imagePath}`;
  };

  // Charger les images avec fallback
  useEffect(() => {
    const loadImages = async () => {
      setState(prev => ({ ...prev, isLoading: true, hasError: false }));

      // Construire la liste de toutes les images à tester
      const primaryImages = Array.isArray(src) ? src : (src ? [src] : []);
      const fallbackImages = generateFallbacks();
      const allImages = [...primaryImages, ...fallbackImages];

      // Tester les images une par une
      for (let i = 0; i < allImages.length; i++) {
        const imageUrl = getFullUrl(allImages[i]);
        
        if (!imageUrl) continue;

        const isValid = await testImage(imageUrl);
        
        if (isValid) {
          setState({
            currentSrc: imageUrl,
            isLoading: false,
            hasError: false,
            isUsingFallback: i >= primaryImages.length
          });
          return;
        }
      }

      // Aucune image n'a fonctionné
      setState({
        currentSrc: '',
        isLoading: false,
        hasError: true,
        isUsingFallback: true
      });
    };

    if (src || fallbacks.length > 0 || categorySlug || productName) {
      loadImages();
    } else {
      setState({
        currentSrc: '',
        isLoading: false,
        hasError: true,
        isUsingFallback: true
      });
    }
  }, [src, generateFallbacks]);

  return {
    src: state.currentSrc,
    isLoading: state.isLoading,
    hasError: state.hasError,
    isUsingFallback: state.isUsingFallback
  };
}

// Fonction utilitaire pour nettoyer le cache périodiquement
export function cleanImageCache() {
  const now = Date.now();
  for (const [url, data] of imageLoadCache.entries()) {
    if (now - data.timestamp > CACHE_DURATION) {
      imageLoadCache.delete(url);
    }
  }
}

// Nettoyage automatique toutes les 10 minutes côté client
if (typeof window !== 'undefined') {
  setInterval(cleanImageCache, 10 * 60 * 1000);
}