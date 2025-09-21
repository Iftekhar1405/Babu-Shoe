'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Printer, Trash2, Minus, Plus, ShoppingBag, User, Package, Loader2, CheckCircle, MapPin } from 'lucide-react';
import Image from 'next/image';
import { Product, ColorData, ORDER_MODE, ORDER_PAYMENT_MODE, Bill, ProductDetail, OrderResponse, CustomerInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  useCurrentBill,
  useClearBill,
  useOptimisticBillUpdates,
  useUpdateBillItemMutation,
  useRemoveBillItemMutation,
  useCreateOrderFromBill
} from '@/lib/api-advance';
import { useDebounce } from '@/hooks/use-debounce';
import { handlePrintBillWithCustomerInfo } from './handlePrintBill';
import { calculateTotal } from '@/lib/utils';
import { handlePrintOrderSummaryFn } from './handlePrintOrderSummary';
import RazorPayButton from './RazorpayPaymentButton';

interface BillDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BillDrawer({ isOpen, onClose }: BillDrawerProps) {
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    customerName: '',
    phoneNumber: '',
    mode: ORDER_MODE.offline,
    paymentMode: ORDER_PAYMENT_MODE.Cash,
    address: '',
  });
  const [discountInputs, setDiscountInputs] = useState<Record<string, number>>({});
  const debouncedDiscountInputs = useDebounce(discountInputs, 800);

  // API hooks
  const { data: bill, isLoading, error, refetch } = useCurrentBill();
  const clearBillMutation = useClearBill();
  const updateBillItemMutation = useUpdateBillItemMutation();
  const removeBillItemMutation = useRemoveBillItemMutation();
  const createOrderMutation = useCreateOrderFromBill();
  const optimisticUpdates = useOptimisticBillUpdates();

  const items = bill?.items || [];
  const total = bill?.totalAmount || 0;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const [quantityInputs, setQuantityInputs] = useState<Record<string, number>>({});
  const debouncedQuantityInputs = useDebounce(quantityInputs, 800);

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  useEffect(() => {
    if (items.length > 0) {
      const initialDiscounts: Record<string, number> = {};
      const initialQuantities: Record<string, number> = {};

      items.forEach(item => {
        const key = `${item.productId._id}-${item.color || ''}`;
        initialDiscounts[key] = item.discountPercent;
        initialQuantities[key] = item.quantity;
      });

      setDiscountInputs(initialDiscounts);
      setQuantityInputs(initialQuantities);
    }
  }, [items]);

  // Handle debounced discount updates
  useEffect(() => {
    const handleDebouncedDiscountUpdates = async () => {
      for (const [key, debouncedDiscount] of Object.entries(debouncedDiscountInputs)) {
        const [productId, color] = key.split('-');
        const currentItem = items.find(item =>
          item.productId._id === productId && item.color === (color || '')
        );

        if (!currentItem || updateBillItemMutation.isPending) continue;

        if (currentItem.discountPercent !== debouncedDiscount) {
          try {
            await updateBillItemMutation.mutateAsync({
              productId,
              color: color || undefined,
              discountPercent: debouncedDiscount
            });
          } catch (error) {
            console.error('Failed to update discount:', error);
            setDiscountInputs(prev => ({
              ...prev,
              [key]: currentItem.discountPercent
            }));
            toast.error('Failed to update discount');
          }
        }
      }
    };

    if (Object.keys(debouncedDiscountInputs).length > 0) {
      handleDebouncedDiscountUpdates();
    }
  }, [debouncedDiscountInputs, items, updateBillItemMutation.isPending]);

  // Handle debounced quantity updates
  useEffect(() => {
    const handleDebouncedQuantityUpdates = async () => {
      for (const [key, debouncedQuantity] of Object.entries(debouncedQuantityInputs)) {
        const [productId, color] = key.split('-');
        const currentItem = items.find(item =>
          item.productId._id === productId && item.color === (color || '')
        );

        if (!currentItem || updateBillItemMutation.isPending) continue;

        if (currentItem.quantity !== debouncedQuantity) {
          try {
            await updateBillItemMutation.mutateAsync({
              productId,
              color: color || undefined,
              quantity: debouncedQuantity
            });
          } catch (error) {
            console.error('Failed to update quantity:', error);
            setQuantityInputs(prev => ({
              ...prev,
              [key]: currentItem.quantity
            }));
            toast.error('Failed to update quantity');
          }
        }
      }
    };

    if (Object.keys(debouncedQuantityInputs).length > 0) {
      handleDebouncedQuantityUpdates();
    }
  }, [debouncedQuantityInputs, items, updateBillItemMutation.isPending]);

  const handleQuantityInputChange = useCallback((productId: string, color: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const key = `${productId}-${color}`;
    setQuantityInputs(prev => ({
      ...prev,
      [key]: newQuantity
    }));
  }, []);

  const handleDiscountInputChange = useCallback((productId: string, color: string, discount: number) => {
    if (discount < 0 || discount > 100) return;

    const key = `${productId}-${color}`;
    setDiscountInputs(prev => ({
      ...prev,
      [key]: discount
    }));
  }, []);

  const handleQuantityButtonClick = useCallback((productId: string, color: string, increment: number) => {
    const key = `${productId}-${color}`;
    const currentQuantity = quantityInputs[key] ??
      items.find(item => item.productId._id === productId && item.color === color)?.quantity ?? 1;

    const newQuantity = currentQuantity + increment;
    if (newQuantity < 1) return;

    setQuantityInputs(prev => ({
      ...prev,
      [key]: newQuantity
    }));
  }, [quantityInputs, items]);

  const handleRemoveItem = async (productId: string, color: string) => {
    optimisticUpdates.removeItemOptimistically(productId, color);

    try {
      await removeBillItemMutation.mutateAsync({
        productId,
        color
      });

      toast.success('Item removed from bill');
    } catch (error) {
      console.error('Failed to remove item:', error);
      await refetch();
      toast.error('Failed to remove item');
    }
  };

  const handleClearBill = async () => {
    optimisticUpdates.clearBillOptimistically();

    try {
      await clearBillMutation.mutateAsync();
      toast.success('Bill cleared');
    } catch (error) {
      console.error('Failed to clear bill:', error);
      await refetch();
      toast.error('Failed to clear bill');
    }
  };

  const getColorImage = (product: Product<true>, colorName: string) => {
    const colorData = product.colors.find((c: ColorData | undefined) => c?.color === colorName);
    return colorData?.urls?.[0] || product.image;
  };

  const openCustomerDialog = () => {
    setCustomerDialogOpen(true);
  };

  const validateCustomerInfo = (requireAddress: boolean = false) => {
    if (!customerInfo.customerName.trim()) {
      toast.error('Customer name is required');
      return false;
    }
    if (!customerInfo.phoneNumber.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    if (customerInfo.phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    if (requireAddress && !customerInfo.address?.trim()) {
      toast.error('Address is required for orders');
      return false;
    }
    return true;
  };

  const resetCustomerInfo = () => {
    setCustomerInfo({
      customerName: '',
      phoneNumber: '',
      mode: ORDER_MODE.offline,
      paymentMode: ORDER_PAYMENT_MODE.Cash,
      address: '',
    });
  };

  const handleCreateOrder = async () => {
    if (!validateCustomerInfo(true)) return;

    try {
      const orderData = {
        name: customerInfo.customerName,
        productDetails: items.map(item => ({
          productId: item.productId._id!,
          quantity: item.quantity,
          color: item.color || '',
          size: item.size,
          amount: item.productId.price,
          discountPercent: item.discountPercent
        })),
        mode: ORDER_MODE[customerInfo.mode],
        paymentMode: ORDER_PAYMENT_MODE[customerInfo.paymentMode],
        address: customerInfo.address!,
        phoneNumber: customerInfo.phoneNumber
      };

      const createdOrder = await createOrderMutation.mutateAsync(orderData);

      setCreatedOrder(createdOrder);
      setCustomerDialogOpen(false);
      setOrderSummaryOpen(true);

      toast.success(`Order #${createdOrder.orderNumber} placed successfully!`);

      // Clear bill and reset form
      handleClearBill();
      resetCustomerInfo();
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  const handlePrintBill = () => {
    if (!validateCustomerInfo(false)) return;

    setCustomerDialogOpen(false);
    handlePrintBillWithCustomerInfo(items, customerInfo);

    // Clear bill and reset form after printing
    handleClearBill();
    resetCustomerInfo();
    onClose();
  };

  const handlePrintOrderSummary = () => {
    if (createdOrder) {
      // Convert order data back to bill format for printing
      const printItems: ProductDetail<true>[] = createdOrder.productDetails.map(pd => {
        const originalItem = items.find(item => item.productId._id === pd.productId);
        return {
          productId: originalItem?.productId!,
          quantity: pd.quantity,
          color: pd.color,
          size: pd.size,
          discountPercent: pd.discountPercent,
          finalPrice: (pd.amount * pd.quantity) * (1 - pd.discountPercent / 100),
          salesPerson: pd.salesPerson
        };
      });

      const customerData = {
        customerName: createdOrder.name,
        phoneNumber: createdOrder.phoneNumber,
        mode: ORDER_MODE[createdOrder.mode as keyof typeof ORDER_MODE],
        paymentMode: ORDER_PAYMENT_MODE[createdOrder.paymentMode as keyof typeof ORDER_PAYMENT_MODE],
        address: createdOrder.address
      };

      handlePrintOrderSummaryFn(createdOrder);
    }
  };

  const handleCloseOrderSummary = () => {
    setOrderSummaryOpen(false);
    setCreatedOrder(null);
    onClose();
  };

  const isUpdatingItem = updateBillItemMutation.isPending;
  const isRemovingItem = removeBillItemMutation.isPending;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:max-w-md lg:max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Bill Summary</h2>
            {items.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {totalItems} item{totalItems !== 1 ? 's' : ''} • ₹{total.toFixed(2)}
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-200 ml-2 flex-shrink-0">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 sm:p-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
              <p className="text-gray-500">Loading bill...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 sm:p-8">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <X className="h-8 w-8 sm:h-12 sm:w-12 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading bill</h3>
              <p className="text-gray-500 mb-4">Please try again</p>
              <Button onClick={() => refetch()} variant="outline">
                Retry
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 sm:p-8">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No items in bill</h3>
              <p className="text-gray-500 text-sm">Add products to get started with your bill</p>
            </div>
          ) : (
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              {items.map((item, index) => (
                <Card key={`${item.productId._id}-${item.color}-${index}`} className="border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex gap-3 sm:gap-4">
                      {/* Product Image */}
                      <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                          src={getColorImage(item.productId, item.color || '')}
                          alt={`${item.productId.name} - ${item.color}`}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = item.productId.image;
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Product Info */}
                        <div className="mb-2 sm:mb-3">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">
                            {item.productId.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              ₹{item.productId.price.toFixed(2)} each
                            </span>
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              Art: {item.productId.articleNo}
                            </Badge>
                          </div>
                          {item.color && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {item.color}
                            </Badge>
                          )}
                          {item.size && (
                            <Badge variant="outline" className="text-xs mt-1 ml-1">
                              Size: {item.size}
                            </Badge>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                          <Label className="text-xs font-medium text-gray-600 min-w-0 flex-shrink-0">Qty:</Label>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                              onClick={() => handleQuantityButtonClick(
                                item.productId._id!,
                                item.color || '',
                                -1
                              )}
                              disabled={
                                (quantityInputs[`${item.productId._id}-${item.color || ''}`] ?? item.quantity) <= 1 ||
                                isUpdatingItem
                              }
                            >
                              {isUpdatingItem ? (
                                <Loader2 className="h-2 w-2 sm:h-3 sm:w-3 animate-spin" />
                              ) : (
                                <Minus className="h-2 w-2 sm:h-3 sm:w-3" />
                              )}
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={quantityInputs[`${item.productId._id}-${item.color || ''}`] ?? item.quantity}
                              onChange={(e) => handleQuantityInputChange(
                                item.productId._id!,
                                item.color || '',
                                parseInt(e.target.value) || 1
                              )}
                              className="h-6 w-12 sm:h-7 sm:w-16 text-xs sm:text-sm text-center p-1"
                              disabled={isUpdatingItem}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                              onClick={() => handleQuantityButtonClick(
                                item.productId._id!,
                                item.color || '',
                                1
                              )}
                              disabled={isUpdatingItem}
                            >
                              {isUpdatingItem ? (
                                <Loader2 className="h-2 w-2 sm:h-3 sm:w-3 animate-spin" />
                              ) : (
                                <Plus className="h-2 w-2 sm:h-3 sm:w-3" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Discount Input */}
                        <div className="mb-2 sm:mb-3">
                          <Label className="text-xs font-medium text-gray-600">Discount %:</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={discountInputs[`${item.productId._id}-${item.color || ''}`] ?? item.discountPercent}
                            onChange={(e) => handleDiscountInputChange(
                              item.productId._id!,
                              item.color || '',
                              parseFloat(e.target.value) || 0
                            )}
                            className="h-7 sm:h-8 text-xs sm:text-sm mt-1"
                            placeholder="0"
                            disabled={isUpdatingItem}
                          />
                        </div>

                        {/* Price Breakdown & Actions */}
                        <div className="flex items-center justify-between">
                          <div className="text-left min-w-0 flex-1">
                            <div className="text-xs text-gray-500">
                              ₹{(item.productId.price * item.quantity).toFixed(2)}
                              {item.discountPercent > 0 && (
                                <span className="text-green-600 ml-1">
                                  (-{item.discountPercent}%)
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-bold text-gray-900">
                              Total: ₹{calculateTotal(item).toFixed(2)}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.productId._id!, item.color || '')}
                            className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0 ml-2"
                            disabled={isRemovingItem}
                          >
                            {isRemovingItem ? (
                              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
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
        {items.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6 space-y-3 sm:space-y-4">
            {/* Total Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  ₹{items.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Discount:</span>
                <span className="font-medium text-green-600">
                  -₹{(items.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0) - total).toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">Final Total:</span>
                <span className="text-xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 sm:gap-3">
              <Button
                onClick={openCustomerDialog}
                className="w-full bg-black hover:bg-gray-800 text-white h-10 sm:h-12 font-semibold text-sm sm:text-base"
                disabled={isUpdatingItem || isRemovingItem}
              >
                <User className="h-4 w-4 mr-2" />
                Process Bill
              </Button>
              <Button
                variant="outline"
                onClick={handleClearBill}
                disabled={clearBillMutation.isPending || isUpdatingItem || isRemovingItem}
                className="w-full border-red-200 text-red-600 hover:bg-red-50 h-8 sm:h-10 text-sm sm:text-base"
              >
                {clearBillMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Items
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Info Dialog - Single Modal for Both Actions */}
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="max-w-xs sm:max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center">
              <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Customer Information
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-4">
            <div>
              <Label htmlFor="customerName" className="text-sm font-medium">
                Customer Name *
              </Label>
              <Input
                id="customerName"
                value={customerInfo.customerName}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
                className="mt-1 text-sm sm:text-base"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber" className="text-sm font-medium">
                Phone Number *
              </Label>
              <Input
                id="phoneNumber"
                value={customerInfo.phoneNumber}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="Enter phone number"
                className="mt-1 text-sm sm:text-base"
              />
            </div>

            <div>
              <Label htmlFor="address" className="text-sm font-medium">
                Address <span className="text-gray-500 text-xs">(Required for orders)</span>
              </Label>
              <Textarea
                id="address"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter delivery address (optional for print only)"
                className="mt-1 text-sm sm:text-base"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Order Mode</Label>
              <Select
                value={customerInfo.mode.toString()}
                onValueChange={(value) => setCustomerInfo(prev => ({ ...prev, mode: parseInt(value) as ORDER_MODE }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Offline</SelectItem>
                  <SelectItem value="1">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Payment Mode</Label>
              <Select
                value={customerInfo.paymentMode.toString()}
                onValueChange={(value) => setCustomerInfo(prev => ({ ...prev, paymentMode: parseInt(value) as ORDER_PAYMENT_MODE }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">UPI</SelectItem>
                  <SelectItem value="1">Cash</SelectItem>
                  <SelectItem value="2">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bill Summary */}
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-medium">{totalItems}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold mt-1">
                <span>Total Amount:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:gap-3">
            <Button
              onClick={handleCreateOrder}
              className="w-full bg-black hover:bg-gray-800 text-white h-10 sm:h-11 text-sm sm:text-base"
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  Place Order
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handlePrintBill}
              className="w-full border-gray-300 hover:bg-gray-50 h-10 sm:h-11 text-sm sm:text-base"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Bill Only
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Success Dialog */}
      <Dialog open={orderSummaryOpen} onOpenChange={setOrderSummaryOpen}>
        <DialogContent className="max-w-xs sm:max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Order Placed Successfully!
            </DialogTitle>
          </DialogHeader>

          {createdOrder && (
            <div className="space-y-3 sm:space-y-4 py-4">
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                    Order #{createdOrder.orderNumber}
                  </div>
                  <div className="text-xs sm:text-sm text-green-700">
                    {new Date(createdOrder.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Customer:</span>
                  <span className="font-medium text-sm">{createdOrder.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="font-medium text-sm">{createdOrder.phoneNumber}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-600">Address:</span>
                  <span className="font-medium text-right flex-1 ml-4 text-sm">{createdOrder.address}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mode:</span>
                  <span className="font-medium capitalize text-sm">{createdOrder.mode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment:</span>
                  <span className="font-medium text-sm">{createdOrder.paymentMode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant="secondary" className="capitalize text-xs">
                    {createdOrder.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Order Items:</h4>
                <div className="max-h-40 sm:max-h-48 overflow-y-auto">
                  {createdOrder.productDetails.map((item, index) => {
                    console.log("🪵 ~ item:", item)
                    const originalItem = items.find(billItem => billItem.productId._id === item.productId);
                    const itemTotal = (item.amount * item.quantity) * (1 - item.discountPercent / 100);

                    return (
                      <div key={index} className="flex justify-between items-center text-sm py-1">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-medium truncate">
                            {originalItem?.productId.name || 'Product'} - {item.color}
                          </div>
                          <div className="text-xs text-gray-500">
                            ₹{item.amount} × {item.quantity}
                            {item.discountPercent > 0 && ` (-${item.discountPercent}%)`}
                          </div>
                        </div>
                        <div className="font-medium flex-shrink-0">
                          ₹{itemTotal.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />
                <div className="flex justify-between font-bold text-base sm:text-lg pt-2">
                  <span>Total Amount:</span>
                  <span>₹{createdOrder.productDetails.reduce((sum, item) => {
                    return sum + (item.amount * item.quantity) * (1 - item.discountPercent / 100);
                  }, 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col gap-2 sm:gap-3">
            {createdOrder && createdOrder.paymentMode === 'UPI' && (
              <RazorPayButton orderId={createdOrder._id} />
            )}
            <Button
              onClick={handlePrintOrderSummary}
              className="w-full bg-black hover:bg-gray-800 text-white h-10 sm:h-11 text-sm sm:text-base"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Order Summary
            </Button>
            <Button
              variant="outline"
              onClick={handleCloseOrderSummary}
              className="w-full h-10 sm:h-11 text-sm sm:text-base"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}