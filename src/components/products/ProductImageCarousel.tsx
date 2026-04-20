'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, Package } from 'lucide-react';
import ProductImage from '@/components/ui/ProductImage';

interface ProductImageCarouselProps {
  images: string[];
  alt?: string;
  categorySlug?: string;
  productName?: string;
}

export default function ProductImageCarousel({ 
  images, 
  alt = "Product image",
  categorySlug,
  productName 
}: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border border-gray-300">
        <div className="aspect-square flex items-center justify-center">
           <div className="text-black text-center">
            <Package className="w-16 h-16 mx-auto mb-2" />
            <p className="text-sm font-medium">Aucune image disponible</p>
            {categorySlug && (
               <p className="text-xs text-black mt-1 capitalize">
                {categorySlug.replace('-', ' ')}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Image principale */}
      <div className="relative bg-white rounded-lg overflow-hidden shadow-sm border border-gray-300">
        <div className="aspect-square relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <ProductImage
                src={images[currentIndex]}
                alt={`${alt} ${currentIndex + 1}`}
                className="w-full h-full"
                categorySlug={categorySlug}
                productName={productName}
              />
            </motion.div>
          </AnimatePresence>

           {/* Contrôles de navigation */}
           {images.length > 1 && (
             <>
               <button
                 onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg transition-all border border-gray-300/50"
               >
                 <ChevronLeft className="h-5 w-5 text-black" />
               </button>
               <button
                 onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg transition-all border border-gray-300/50"
               >
                 <ChevronRight className="h-5 w-5 text-black" />
               </button>
             </>
           )}

           {/* Bouton zoom */}
           <button
             onClick={() => setIsZoomed(true)}
              className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg transition-all border border-gray-300/50"
           >
             <ZoomIn className="h-5 w-5 text-black" />
           </button>

           {/* Indicateur de position */}
           {images.length > 1 && (
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
               {images.map((_, index) => (
                 <button
                   key={index}
                   onClick={() => goToImage(index)}
                    className={`w-2 h-2 rounded-full transition-all border border-white/50 ${
                      index === currentIndex
                        ? 'bg-white shadow-lg'
                        : 'bg-gray-800/60 hover:bg-gray-800/80'
                    }`}
                 />
               ))}
             </div>
           )}
        </div>
      </div>

      {/* Miniatures */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
               className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                 index === currentIndex
                   ? 'border-primary shadow-md'
                   : 'border-gray-300 hover:border-gray-400'
               }`}
            >
              <ProductImage
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full"
                categorySlug={categorySlug}
                productName={productName}
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal zoom */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-[800px] h-[800px] max-h-[80vh] max-w-[80vw] relative bg-white rounded-lg overflow-hidden">
                <ProductImage
                  src={images[currentIndex]}
                  alt={`${alt} ${currentIndex + 1} - Agrandie`}
                  className="w-full h-full"
                  categorySlug={categorySlug}
                  productName={productName}
                />
              </div>
              
               {/* Contrôles dans le modal */}
               {images.length > 1 && (
                 <>
                   <button
                     onClick={prevImage}
                     className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 border border-white/20 rounded-full backdrop-blur-sm transition-all"
                   >
                     <ChevronLeft className="h-6 w-6 text-white drop-shadow-lg" />
                   </button>
                   <button
                     onClick={nextImage}
                     className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 border border-white/20 rounded-full backdrop-blur-sm transition-all"
                   >
                     <ChevronRight className="h-6 w-6 text-white drop-shadow-lg" />
                   </button>
                 </>
               )}

               {/* Fermer */}
               <button
                 onClick={() => setIsZoomed(false)}
                 className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 border border-white/20 rounded-full backdrop-blur-sm transition-all"
               >
                 <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>

               {/* Info image dans le modal */}
               <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
                 <p className="text-sm">
                   Image {currentIndex + 1} / {images.length}
                 </p>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}