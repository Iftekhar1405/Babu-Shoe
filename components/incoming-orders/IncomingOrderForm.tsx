'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogTrigger, DialogContent, DialogClose, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateIncomingOrderDto } from '@/types';
import { useCreateIncomingOrder } from '@/lib/api-advance';
import { Plus, Minus, Loader2, AlertCircle } from 'lucide-react';

interface IncomingOrderFormProps {
  onCreated?: () => void;
}

interface ProductDetailForm {
  productId: string;
  color?: string;
  sizes: string[];
  quantity: number;
  sizesInput: string; // For form input handling
}

export default function IncomingOrderForm({ onCreated }: IncomingOrderFormProps) {
  const [open, setOpen] = useState(false);
  
  // Form state
  const [vendorId, setVendorId] = useState('');
  const [billImgUrl, setBillImgUrl] = useState('');
  const [matchPercentage, setMatchPercentage] = useState<string>('');
  const [productDetails, setProductDetails] = useState<ProductDetailForm[]>([
    { productId: '', color: '', sizes: [], sizesInput: '', quantity: 1 },
  ]);

  const createOrderMutation = useCreateIncomingOrder({
    onSuccess: () => {
      setOpen(false);
      resetForm();
      onCreated?.();
    },
    onError: (error) => {
      // Error is handled by the mutation error state
      console.error('Create order failed:', error);
    },
  });

  const resetForm = () => {
    setVendorId('');
    setBillImgUrl('');
    setMatchPercentage('');
    setProductDetails([{ productId: '', color: '', sizes: [], sizesInput: '', quantity: 1 }]);
  };

  const addProductRow = () => {
    setProductDetails(prev => [
      ...prev,
      { productId: '', color: '', sizes: [], sizesInput: '', quantity: 1 }
    ]);
  };

  const removeProductRow = (index: number) => {
    if (productDetails.length > 1) {
      setProductDetails(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateProductField = (index: number, field: keyof ProductDetailForm, value: any) => {
    setProductDetails(prev => prev.map((item, i) => {
      if (i === index) {
        if (field === 'sizesInput') {
          // Update both sizesInput and sizes array
          const sizesArray = value ? value.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
          return { ...item, sizesInput: value, sizes: sizesArray };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const validateForm = (): string | null => {
    if (!vendorId.trim()) return 'Vendor ID is required';
    
    for (let i = 0; i < productDetails.length; i++) {
      const product = productDetails[i];
      if (!product.productId.trim()) return `Product ID is required for item ${i + 1}`;
      if (product.quantity <= 0) return `Quantity must be greater than 0 for item ${i + 1}`;
    }
    
    if (matchPercentage && (Number(matchPercentage) < 0 || Number(matchPercentage) > 100)) {
      return 'Match percentage must be between 0 and 100';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    const payload: CreateIncomingOrderDto = {
      vendorId: vendorId.trim(),
      productDetails: productDetails.map(({ sizesInput, ...product }) => ({
        productId: product.productId.trim(),
        color: product.color?.trim() || undefined,
        sizes: product.sizes,
        quantity: Number(product.quantity),
      })),
      billImgUrl: billImgUrl.trim() || undefined,
      matchPercentage: matchPercentage ? Number(matchPercentage) : undefined,
      comments: [],
    };

    createOrderMutation.mutate(payload);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !createOrderMutation.isPending) {
      resetForm();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Incoming Order
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Incoming Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {createOrderMutation.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                <p className="text-red-800 text-sm">
                  {createOrderMutation.error instanceof Error 
                    ? createOrderMutation.error.message 
                    : 'Failed to create incoming order'}
                </p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor ID *
              </label>
              <Input
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                placeholder="Enter vendor ID"
                required
                disabled={createOrderMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Match Percentage
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                value={matchPercentage}
                onChange={(e) => setMatchPercentage(e.target.value)}
                placeholder="0-100"
                disabled={createOrderMutation.isPending}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bill Image URL
            </label>
            <Input
              type="url"
              value={billImgUrl}
              onChange={(e) => setBillImgUrl(e.target.value)}
              placeholder="https://example.com/bill-image.jpg"
              disabled={createOrderMutation.isPending}
            />
          </div>

          {/* Product Details */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Product Details</h4>
              <Button 
                type="button" 
                onClick={addProductRow} 
                variant="outline" 
                size="sm"
                disabled={createOrderMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            <div className="space-y-4">
              {productDetails.map((product, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-medium text-gray-700">
                      Product {index + 1}
                    </h5>
                    {productDetails.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeProductRow(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        disabled={createOrderMutation.isPending}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Product ID *
                      </label>
                      <Input
                        value={product.productId}
                        onChange={(e) => updateProductField(index, 'productId', e.target.value)}
                        placeholder="Product ID"
                        required
                        disabled={createOrderMutation.isPending}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Color
                      </label>
                      <Input
                        value={product.color}
                        onChange={(e) => updateProductField(index, 'color', e.target.value)}
                        placeholder="Color"
                        disabled={createOrderMutation.isPending}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Sizes (comma-separated)
                      </label>
                      <Input
                        value={product.sizesInput}
                        onChange={(e) => updateProductField(index, 'sizesInput', e.target.value)}
                        placeholder="S, M, L, XL"
                        disabled={createOrderMutation.isPending}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Quantity *
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={product.quantity}
                        onChange={(e) => updateProductField(index, 'quantity', Number(e.target.value))}
                        required
                        disabled={createOrderMutation.isPending}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <DialogClose asChild>
              <Button 
                type="button" 
                variant="outline" 
                disabled={createOrderMutation.isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createOrderMutation.isPending}>
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Order'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}