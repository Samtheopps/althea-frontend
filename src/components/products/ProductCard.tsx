'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Star, Badge } from 'lucide-react';
import toast from 'react-hot-toast';

import { Product } from '@/types/api';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem(product, 1);
    toast.success(`${product.name} ajouté au panier !`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsWishlisted(!isWishlisted);
    toast.success(
      isWishlisted 
        ? 'Produit retiré de la liste de souhaits'
        : 'Produit ajouté à la liste de souhaits'
    );
  };

  const handleProductClick = () => {
    router.push(`/products/${product.slug}`);
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer"
        onClick={handleProductClick}
      >
        <div className="flex p-6">
          {/* Image */}
          <div className="relative w-32 h-32 flex-shrink-0 mr-6">
            <div className={`absolute inset-0 bg-gray-200 rounded-lg ${!imageLoaded ? 'animate-pulse' : ''}`} />
            <Image
              src={product.images?.[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className={`object-cover rounded-lg transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              sizes="128px"
            />
            
            {/* Badges */}
            {product.isNew && (
              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Nouveau
              </div>
            )}
            {product.discount && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                -{product.discount}%
              </div>
            )}
          </div>

          {/* Contenu */}
          <div className="flex-1">
            <div className="flex justify-between">
              <div className="flex-1">
                {/* Marque et référence */}
                {product.brand && (
                  <p className="text-sm text-gray-700 mb-1 font-medium">{product.brand}</p>
                )}
                
                {/* Référence produit */}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs product-reference text-gray-600 font-mono">
                    REF: ALT-{product.id.slice(-6).toUpperCase()}
                  </p>
                  {product.stock !== undefined && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.stock > 10 
                        ? 'bg-green-100 text-green-800'
                        : product.stock > 0 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      Stock: {product.stock}
                    </span>
                  )}
                </div>

                {/* Titre */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                {/* Description */}
                <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                  {product.description}
                </p>

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating!)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      ({product.reviewsCount || 0} avis)
                    </span>
                  </div>
                )}

                {/* Certifications */}
                {product.certifications && product.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.certifications.slice(0, 3).map((cert) => (
                      <span
                        key={cert}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        <Badge className="w-3 h-3 mr-1" />
                        {cert}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Prix et actions */}
              <div className="flex flex-col items-end justify-between ml-6">
                <div className="text-right">
                  {product.originalPrice && product.originalPrice > product.price && (
                    <p className="text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </p>
                  )}
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-sm text-gray-600">HT</p>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <button
                    onClick={handleToggleWishlist}
                    className={`p-2 rounded-lg border transition-colors ${
                      isWishlisted
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className="h-4 w-4" />
                  </button>

                  <button
                    onClick={handleAddToCart}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover transition-colors"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Ajouter
                  </button>
                </div>

                {product.stock !== undefined && product.stock < 10 && (
                  <p className="text-sm text-orange-600 mt-2">
                    Plus que {product.stock} en stock
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Vue grille
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col"
      onClick={handleProductClick}
    >
      <div className="relative overflow-hidden rounded-t-lg flex-shrink-0">
        {/* Image principale */}
        <div className="relative w-full h-48 bg-gray-200">
          <div className={`absolute inset-0 bg-gray-200 rounded-t-lg ${!imageLoaded ? 'animate-pulse' : ''}`} />
          <Image
            src={product.images?.[0] || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          
           {/* Overlay avec indication au hover */}
           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
             <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <span className="inline-flex items-center px-4 py-2 bg-white text-gray-900 rounded-lg shadow-lg hover:bg-gray-50 transition-colors border border-gray-200 font-medium">
                 <Eye className="mr-2 h-4 w-4" />
                 Voir détails
               </span>
             </div>
           </div>

          {/* Badges */}
          <div className="absolute top-3 left-3">
            {product.isNew && (
              <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full mb-2">
                Nouveau
              </div>
            )}
            {product.discount && (
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                -{product.discount}%
              </div>
            )}
          </div>

           {/* Bouton wishlist */}
           <button
             onClick={handleToggleWishlist}
             className={`absolute top-3 right-3 p-2 rounded-lg transition-colors border ${
               isWishlisted
                 ? 'bg-red-500 text-white border-red-500'
                 : 'bg-white/95 text-gray-700 hover:bg-white border-gray-200 backdrop-blur-sm shadow-sm'
             }`}
           >
             <Heart className="h-4 w-4" />
           </button>
        </div>

        {/* Contenu */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Marque et référence */}
          {product.brand && (
            <p className="text-sm text-gray-700 mb-1 font-medium">{product.brand}</p>
          )}
          
          {/* Référence produit */}
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <p className="text-xs product-reference text-gray-600 font-mono">
              REF: ALT-{product.id.slice(-6).toUpperCase()}
            </p>
            {product.stock !== undefined && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                product.stock > 10 
                  ? 'bg-green-100 text-green-800'
                  : product.stock > 0 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {product.stock}
              </span>
            )}
          </div>

          {/* Titre */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 flex-shrink-0">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center mb-3 flex-shrink-0">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating!)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                ({product.reviewsCount || 0})
              </span>
            </div>
          )}

          {/* Prix */}
          <div className="mb-3 flex-shrink-0">
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </p>
            )}
            <p className="text-xl font-bold text-gray-900">
              {formatPrice(product.price)} <span className="text-sm font-normal text-gray-600">HT</span>
            </p>
          </div>

          {/* Stock */}
          {product.stock !== undefined && product.stock < 10 && (
            <p className="text-sm text-orange-600 mb-3 flex-shrink-0">
              Plus que {product.stock} en stock
            </p>
          )}

          {/* Spacer pour pousser le bouton vers le bas */}
          <div className="flex-1"></div>

          {/* Bouton d'ajout au panier */}
          <button
            onClick={handleAddToCart}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover transition-colors mt-auto"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Ajouter au panier
          </button>
        </div>
      </div>
    </motion.div>
  );
}