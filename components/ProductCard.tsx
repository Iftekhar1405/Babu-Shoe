'use client';

import Image from 'next/image';
import { Product } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToBill: (product: Product) => void;
}

export function ProductCard({ product, onAddToBill }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2">Article: {product.articleNo}</p>
        <p className="text-xl font-bold text-black">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onAddToBill(product)}
          className="w-full bg-black hover:bg-gray-800 text-white transition-colors"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Bill
        </Button>
      </CardFooter>
    </Card>
  );
}