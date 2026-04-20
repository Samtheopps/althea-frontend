'use client';

import { useState, useEffect } from 'react';
import { Package, Stethoscope, Thermometer, Activity, Wrench, FlaskConical } from 'lucide-react';
import apiService from '@/services/api';

interface ProductImageProps {
  src?: string | string[];
  alt: string;
  className?: string;
  fallbackSrc?: string;
  categorySlug?: string;
  productName?: string;
}

export default function ProductImage({
  src,
  alt,
  className = '',
  fallbackSrc,
  categorySlug,
  productName
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);

  // Reset des erreurs quand src change
  useEffect(() => {
    setImageError(false);
    setFallbackError(false);
    setCurrentSrcIndex(0);
    setIsLoading(true);
  }, [src]);

  // Fonction pour construire l'URL complète de l'image
  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Si l'image commence par http/https, la retourner telle quelle
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Si l'image commence par /, la considérer comme un chemin local
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    
    // Sinon, construire l'URL avec l'API
    return `${apiService.mediaBaseUrl}/${imagePath}`;
  };

  // Générer une liste d'images fallback intelligente
  const getFallbackImages = (): string[] => {
    const fallbacks: string[] = [];
    
    // 1. Fallback fourni explicitement
    if (fallbackSrc) {
      fallbacks.push(fallbackSrc);
    }

    // 2. Images par catégorie
    if (categorySlug) {
      const categoryImages: Record<string, string> = {
        'instruments-diagnostic': '/images/category-diagnostic.jpg',
        'diagnostic': '/images/category-diagnostic.jpg',
        'consommables': '/images/category-consommables.jpg',
        'mobilier': '/images/category-mobilier.jpg',
        'sterilisation': '/images/category-sterilisation.jpg'
      };
      
      const categoryImage = categoryImages[categorySlug.toLowerCase()];
      if (categoryImage) fallbacks.push(categoryImage);
    }

    // 3. Images par type de produit (basé sur le nom)
    if (productName) {
      const productLower = productName.toLowerCase();
      if (productLower.includes('stéthoscope') || productLower.includes('stethoscope')) {
        fallbacks.push('/images/stethoscope-1.jpg');
      } else if (productLower.includes('thermomètre') || productLower.includes('thermometre')) {
        fallbacks.push('/images/thermometre-1.jpg');
      } else if (productLower.includes('tensiomètre') || productLower.includes('tensiometre')) {
        fallbacks.push('/images/tensiometre-1.jpg');
      } else if (productLower.includes('oxymètre') || productLower.includes('oxymetre')) {
        fallbacks.push('/images/oxymetre-1.jpg');
      }
    }

    // 4. Image placeholder générique
    fallbacks.push('/placeholder-product.jpg');

    return [...new Set(fallbacks)]; // Supprimer les doublons
  };

  // Obtenir l'icône appropriée pour le placeholder basé sur la catégorie
  const getCategoryIcon = () => {
    if (!categorySlug) return Package;
    
    const iconMap: Record<string, any> = {
      'instruments-diagnostic': Stethoscope,
      'diagnostic': Stethoscope,
      'consommables': FlaskConical,
      'mobilier': Activity,
      'sterilisation': Wrench
    };
    
    return iconMap[categorySlug.toLowerCase()] || Package;
  };

  const IconComponent = getCategoryIcon();

  // Gérer l'erreur d'image avec tentative de fallback
  const handleImageError = () => {
    const images = Array.isArray(src) ? src : (src ? [src] : []);
    const fallbackImages = getFallbackImages();
    const allImages = [...images, ...fallbackImages];
    
    if (currentSrcIndex < allImages.length - 1) {
      // Essayer l'image suivante
      setCurrentSrcIndex(currentSrcIndex + 1);
      setIsLoading(true);
    } else {
      // Plus d'images à essayer
      setImageError(true);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  // Obtenir l'image actuelle à afficher
  const getCurrentImageUrl = (): string => {
    const images = Array.isArray(src) ? src : (src ? [src] : []);
    const fallbackImages = getFallbackImages();
    const allImages = [...images, ...fallbackImages];
    
    if (currentSrcIndex < allImages.length) {
      return getImageUrl(allImages[currentSrcIndex]);
    }
    
    return '';
  };

  const currentImageUrl = getCurrentImageUrl();

  // Si toutes les images ont échoué, afficher le placeholder
  if (!currentImageUrl || imageError) {
    return (
      <div className={`bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center ${className} group`}>
         <div className="text-center text-black group-hover:text-black transition-colors">
          <IconComponent className="h-12 w-12 mx-auto mb-2" />
          <p className="text-xs font-medium">Image non disponible</p>
          {categorySlug && (
             <p className="text-xs text-black mt-1 capitalize">
              {categorySlug.replace('-', ' ')}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse flex items-center justify-center">
           <IconComponent className="h-12 w-12 text-black" />
        </div>
      )}
      <img
        src={currentImageUrl}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-300 ${
          isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
        style={{ 
          filter: isLoading ? 'blur(4px)' : 'none'
        }}
      />
      
      {/* Overlay subtil pour améliorer l'esthétique */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
    </div>
  );
}