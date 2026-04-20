'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';

interface CartBadgeProps {
  className?: string;
}

export default function CartBadge({ className = "" }: CartBadgeProps) {
  const { getTotalItems, isHydrated, setHydrated } = useCartStore();

  useEffect(() => {
    setHydrated(true);
  }, [setHydrated]);

  // Ne pas afficher le badge avant l'hydratation pour éviter les erreurs SSR/CSR
  if (!isHydrated || getTotalItems() === 0) {
    return null;
  }

  return (
    <span className={`absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm ${className}`}>
      {getTotalItems()}
    </span>
  );
}