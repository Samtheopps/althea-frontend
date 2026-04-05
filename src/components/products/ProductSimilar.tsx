'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Product } from '@/types/api';
import { productService } from '@/services/productService';
import ProductCard from './ProductCard';

interface ProductSimilarProps {
  productId: string;
  categoryId?: string;
}

export default function ProductSimilar({ productId, categoryId }: ProductSimilarProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const productsPerPage = 4;

  useEffect(() => {
    loadSimilarProducts();
  }, [productId]);

  const loadSimilarProducts = async () => {
    try {
      const data = await productService.getSimilarProducts(productId, 8);
      setProducts(data);
    } catch (error) {
      // En cas d'erreur, charger des produits récents
      try {
        const fallbackData = await productService.getProducts({ 
          limit: 8,
          sortBy: 'newest' 
        });
        setProducts(fallbackData.products.filter(p => p.id !== productId));
      } catch (fallbackError) {
        console.error('Error loading similar products:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    const maxIndex = Math.max(0, products.length - productsPerPage);
    setCurrentIndex(prev => Math.min(prev + productsPerPage, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - productsPerPage, 0));
  };

  const visibleProducts = products.slice(currentIndex, currentIndex + productsPerPage);
  const canGoNext = currentIndex + productsPerPage < products.length;
  const canGoPrev = currentIndex > 0;

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* En-tête */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            Produits similaires
          </h3>
          
          {/* Navigation */}
          {products.length > productsPerPage && (
            <div className="flex items-center space-x-2">
              <button
                onClick={prevSlide}
                disabled={!canGoPrev}
                className={`p-2 rounded-full border transition-colors ${
                  canGoPrev
                    ? 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextSlide}
                disabled={!canGoNext}
                className={`p-2 rounded-full border transition-colors ${
                  canGoNext
                    ? 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grille de produits */}
      <div className="p-6">
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {visibleProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard product={product} viewMode="grid" />
            </motion.div>
          ))}
        </motion.div>

        {/* Indicateurs */}
        {products.length > productsPerPage && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: Math.ceil(products.length / productsPerPage) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * productsPerPage)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  Math.floor(currentIndex / productsPerPage) === index
                    ? 'bg-primary'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}