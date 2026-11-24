import { createContext } from 'react';
import type { CartItem } from '../types/Cart';
import type { Product } from '../types/Product';

export interface CartContextValue {
  items: readonly CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);
