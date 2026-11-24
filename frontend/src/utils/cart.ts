import type { CartItem } from '../types/Cart';
import { formatPriceBRL } from './products';

export const CART_STORAGE_KEY = 'gean-bebidas:cart';

export const calculateCartItemsCount = (items: readonly CartItem[]): number =>
  items.reduce((total, item) => total + item.quantity, 0);

export const calculateCartTotal = (items: readonly CartItem[]): number =>
  items.reduce((total, item) => total + item.product.price * item.quantity, 0);

export const loadCartFromStorage = (key = CART_STORAGE_KEY): CartItem[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0 &&
        Boolean(item.product) &&
        typeof item.product._id === 'string' &&
        !item.product._id.startsWith('mock-') &&
        typeof item.product.price === 'number',
    );
  } catch {
    return [];
  }
};

export const saveCartToStorage = (
  items: readonly CartItem[],
  key = CART_STORAGE_KEY,
): void => {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Ignora falhas de quota/acesso ao storage
  }
};

export const buildWhatsAppOrderMessage = (
  items: readonly CartItem[],
): string => {
  const lines = items.map(
    ({ product, quantity }) =>
      `• ${quantity}x ${product.name} — ${formatPriceBRL(product.price * quantity)}`,
  );
  const total = formatPriceBRL(calculateCartTotal(items));

  return [
    'Olá! Gostaria de fazer um pedido na Gean Bebidas:',
    '',
    ...lines,
    '',
    `Total: ${total}`,
  ].join('\n');
};

export const buildWhatsAppOrderUrl = (
  baseUrl: string,
  items: readonly CartItem[],
): string => {
  const message = buildWhatsAppOrderMessage(items);
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
};
