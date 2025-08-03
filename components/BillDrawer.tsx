'use client';

import { useState, useEffect } from 'react';
import { X, Printer, Trash2, Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import { BillItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface BillDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: BillItem[];
  onUpdateItem: (productId: string, updates: Partial<BillItem>) => void;
  onRemoveItem: (productId: string) => void;
  onClearBill: () => void;
  onPrintBill: () => void;
}

export function BillDrawer({
  isOpen,
  onClose,
  items,
  onUpdateItem,
  onRemoveItem,
  onClearBill,
  onPrintBill,
}: BillDrawerProps) {
  const [localItems, setLocalItems] = useState<BillItem[]>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const calculateFinalPrice = (item: BillItem) => {
    const basePrice = item.product.price * item.quantity;
    const discountAmount = (basePrice * item.discount) / 100;
    return basePrice - discountAmount;
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedItems = localItems.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity, finalPrice: calculateFinalPrice({ ...item, quantity: newQuantity }) }
        : item
    );
    setLocalItems(updatedItems);
    onUpdateItem(productId, { quantity: newQuantity });
  };

  const handleDiscountChange = (productId: string, discount: number) => {
    if (discount < 0 || discount > 100) return;
    const item = localItems.find(item => item.product.id === productId);
    if (!item) return;

    const finalPrice = calculateFinalPrice({ ...item, discount });
    const updatedItems = localItems.map(item =>
      item.product.id === productId
        ? { ...item, discount, finalPrice }
        : item
    );
    setLocalItems(updatedItems);
    onUpdateItem(productId, { discount, finalPrice });
  };

  const total = localItems.reduce((sum, item) => sum + item.finalPrice, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Bill Summary</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {localItems.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>No items in bill</p>
              <p className="text-sm mt-1">Add products to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {localItems.map((item) => (
                <Card key={item.product.id} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{item.product.name}</h4>
                        <p className="text-sm text-gray-500">${item.product.price.toFixed(2)} each</p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <Label className="text-xs">Qty:</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Discount Input */}
                        <div className="mt-2">
                          <Label className="text-xs">Discount %:</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount}
                            onChange={(e) => handleDiscountChange(item.product.id, parseFloat(e.target.value) || 0)}
                            className="h-8 text-sm mt-1"
                          />
                        </div>

                        {/* Final Price */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-semibold">Final: ${item.finalPrice.toFixed(2)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveItem(item.product.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {localItems.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold">${total.toFixed(2)}</span>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onPrintBill}
                className="flex-1 border-gray-300 hover:bg-gray-50"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Bill
              </Button>
              <Button
                variant="outline"
                onClick={onClearBill}
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Bill
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}