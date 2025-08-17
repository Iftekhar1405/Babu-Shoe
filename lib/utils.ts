import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProductDetail {
  productId: { price: number };
  quantity: number;
  discountPercent: number;
}

export function calculateTotal(item: ProductDetail): number {
  const discountedPrice = item.productId.price * (1 - item.discountPercent / 100);
  return discountedPrice * item.quantity;
}
