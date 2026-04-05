import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/api';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedVariant?: {
    id: string;
    name: string;
    price: number;
  };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (product: Product, quantity?: number, variant?: any) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  
  // Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemById: (productId: string) => CartItem | undefined;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1, variant) => {
        const existingItemIndex = get().items.findIndex(
          item => 
            item.product.id === product.id && 
            item.selectedVariant?.id === variant?.id
        );

        if (existingItemIndex >= 0) {
          // Si l'item existe déjà, on augmente la quantité
          const newItems = [...get().items];
          newItems[existingItemIndex].quantity += quantity;
          set({ items: newItems });
        } else {
          // Sinon on ajoute un nouvel item
          const newItem: CartItem = {
            id: `${product.id}-${variant?.id || 'default'}`,
            product,
            quantity,
            selectedVariant: variant,
          };
          set({ items: [...get().items, newItem] });
        }
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter(item => item.id !== itemId) });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const newItems = get().items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
        set({ items: newItems });
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.selectedVariant?.price || item.product.price;
          return total + (price * item.quantity);
        }, 0);
      },

      getItemById: (productId) => {
        return get().items.find(item => item.product.id === productId);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);