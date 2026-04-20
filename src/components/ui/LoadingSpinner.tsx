'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function LoadingSpinner({
  size = 'md',
  text,
  fullScreen = false,
  className = ''
}: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className={`mx-auto animate-spin text-primary ${sizeStyles[size]}`} />
          {text && (
            <p className={`mt-4 text-black ${textSizes[size]}`}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <Loader2 className={`mx-auto animate-spin text-primary ${sizeStyles[size]}`} />
        {text && (
          <p className={`mt-2 text-black ${textSizes[size]}`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

// Composant pour les skeletons de produits
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
      <div className="animate-pulse">
        {/* Image skeleton */}
        <div className="w-full h-48 bg-gray-200 rounded-t-lg" />
        
        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          {/* Brand */}
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          
          {/* Title */}
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-full" />
            <div className="h-5 bg-gray-200 rounded w-2/3" />
          </div>
          
          {/* Rating */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-4 bg-gray-200 rounded" />
            ))}
            <div className="h-4 bg-gray-200 rounded w-12 ml-2" />
          </div>
          
          {/* Price */}
          <div className="h-6 bg-gray-200 rounded w-1/2" />
          
          {/* Button */}
          <div className="h-10 bg-gray-200 rounded w-full mt-4" />
        </div>
      </div>
    </div>
  );
}

// Composant pour les skeletons de catégories
export function CategoryCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="animate-pulse">
        {/* Image skeleton */}
        <div className="w-full h-48 bg-gray-200 rounded-t-lg" />
        
        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          
          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
          
          {/* Product count */}
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}