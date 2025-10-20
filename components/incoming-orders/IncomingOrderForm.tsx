'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogTrigger, DialogContent, DialogClose, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateIncomingOrderDto } from '@/types';
import { useCreateIncomingOrder, useProducts, useUploadImagesLegacy } from '@/lib/api-advance';
import { Plus, Minus, Loader2, AlertCircle, Upload, Check, X } from 'lucide-react';
import { useVendors } from '@/lib/vendor.service';
import { Select, SelectItem, SelectContent, SelectValue, SelectTrigger } from '../ui/select';
import { toast } from 'sonner';
import { useScreenSize } from '@/context/Screen-size-context';

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
  const { isMobile } = useScreenSize();

  // Form state
  const [vendorId, setVendorId] = useState('');
  const [billImgUrl, setBillImgUrl] = useState('');
  const [matchPercentage, setMatchPercentage] = useState<string>('');
  const [productDetails, setProductDetails] = useState<ProductDetailForm[]>([
    { productId: '', color: '', sizes: [], sizesInput: '', quantity: 1 },
  ]);

  const { data: vendors } = useVendors()
  const { data: products } = useProducts()

  const { mutateAsync, isPending } = useUploadImagesLegacy();
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

  const uploadImages = async (files: FileList) => {


    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });
      formData.append('color', 'bill');

      const result = await mutateAsync(formData);
      setBillImgUrl(result.urls[0])

      toast('Success', { description: 'Images uploaded successfully' });

    } catch (error) {
      console.error('Failed to upload images:', error);
      toast('Error', { description: 'Failed to upload images. Please try again.' });
    }
  };

  const removeImage = () => {
    setBillImgUrl('')
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
                Vendor*
              </label>
              {/* <Input
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                placeholder="Enter vendor ID"
                required
                disabled={createOrderMutation.isPending}
              /> */}
              <Select
                value={vendorId}
                onValueChange={setVendorId}
              >
                <SelectTrigger className="mt-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
                  <SelectValue placeholder="Select Vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors ? vendors.map((el) => (
                    <SelectItem value={el._id || ''}
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={el.logo}
                          alt={el.name}
                          className="w-6 h-6 rounded-full object-cover border border-gray-300"
                        />
                        <span className="truncate">{el.name}</span>
                      </div>
                    </SelectItem>
                  ))
                    : <>Vendor Not Found</>
                  }
                </SelectContent>
              </Select>
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

          <div className="space-y-4">
            <label
              className={`flex flex-col items-center border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
          ${isPending
                  ? "border-purple-300 bg-purple-50 opacity-50 cursor-not-allowed"
                  : "border-purple-300 hover:border-purple-400 hover:bg-purple-50 cursor-pointer"
                }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                disabled={isPending}
                onChange={(e) => {
                  if (e.target.files) {
                    uploadImages(e.target.files);
                    e.target.value = "";
                  }
                }}
              />

              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  {isPending ? (
                    <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
                  ) : (
                    <Upload className="h-6 w-6 text-purple-600" />
                  )}
                </div>

                <p className="text-sm font-medium text-gray-900">
                  {isPending ? "Uploading Images..." : "Upload Color Images"}
                </p>
              </div>
            </label>

            {billImgUrl && (
              <div className={`grid ${isMobile ? "grid-cols-3" : "grid-cols-6"} gap-3`}>
                <div className="relative group">
                  <img
                    src={billImgUrl}
                    alt="Uploaded"
                    className="w-full h-20 object-cover rounded-lg border-2 border-purple-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
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
                        Product*
                      </label>
                      {/* <Input
                        value={product.productId}
                        onChange={(e) => updateProductField(index, 'productId', e.target.value)}
                        placeholder="Product ID"
                        required
                        disabled={createOrderMutation.isPending}
                      /> */}
                      <Select
                        value={product.productId}
                        onValueChange={(value) => updateProductField(index, 'productId', value)}
                        disabled={createOrderMutation.isPending}
                      >
                        <SelectTrigger className="mt-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
                          <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products ? products.map((el) => (
                            <SelectItem value={el._id || ''}
                              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={el.image}
                                  alt={el.name}
                                  className="w-6 h-6 rounded-full object-cover border border-gray-300"
                                />
                                <span className="truncate">{el.name} - {el.articleNo} - {el.price}</span>
                              </div>
                            </SelectItem>
                          ))
                            : <>Product Not Found</>
                          }
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Color
                      </label>
                      {/* <Input
                        value={product.color}
                        onChange={(e) => updateProductField(index, 'color', e.target.value)}
                        placeholder="Color"
                        disabled={createOrderMutation.isPending}
                      /> */}
                      <Select
                        value={product.color}
                        onValueChange={(value) => updateProductField(index, 'color', value)}
                        disabled={createOrderMutation.isPending}
                      >
                        <SelectTrigger className="mt-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
                          <SelectValue placeholder="Select Color" />
                        </SelectTrigger>
                        <SelectContent>
                          {products && products.find((el) => el._id == product.productId) ? products.find((el) => el._id == product.productId)?.colors.map((el) => (el &&
                            <SelectItem value={el?.color || ''}
                              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={el?.urls?.[0] || ''}
                                  alt={el.color}
                                  className="w-6 h-6 rounded-full object-cover border border-gray-300"
                                />
                                <span className="truncate">{el.color} </span>
                              </div>
                            </SelectItem>
                          ))
                            : <>Colors Not Found</>
                          }
                        </SelectContent>
                      </Select>
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