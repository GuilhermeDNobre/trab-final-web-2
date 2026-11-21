import { useContext } from 'react';
import {
  CartContext,
  type CartContextValue,
} from '../contexts/cartContextValue';

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};
