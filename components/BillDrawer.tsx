'use client';

import { useState, useEffect } from 'react';
import { X, Printer, Trash2, Minus, Plus, ShoppingBag, User, Package } from 'lucide-react';
import Image from 'next/image';
import { ProductDetail, Product, ColorData, ORDER_MODE, ORDER_PAYMENT_MODE } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface BillDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: ProductDetail<true>[];
  onUpdateItem: (productId: string, color: string, updates: Partial<ProductDetail<true>>) => void;
  onRemoveItem: (productId: string, color: string) => void;
  onClearBill: () => void;
  onPrintBill: (items: ProductDetail<true>[], customerInfo: CustomerInfo) => void;
  onAddToOrder: (items: ProductDetail<true>[], customerInfo: CustomerInfo) => void;
}

interface CustomerInfo {
  customerName: string;
  phoneNumber: string;
  mode: ORDER_MODE;
  paymentMode: ORDER_PAYMENT_MODE;
}

export function BillDrawer({
  isOpen,
  onClose,
  items,
  onUpdateItem,
  onRemoveItem,
  onClearBill,
  onPrintBill,
  onAddToOrder,
}: BillDrawerProps) {
  const [localItems, setLocalItems] = useState<ProductDetail<true>[]>(items);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    customerName: '',
    phoneNumber: '',
    mode: ORDER_MODE.offline,
    paymentMode: ORDER_PAYMENT_MODE.Cash,
  });

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const calculateFinalPrice = (item: ProductDetail<true>) => {
    const basePrice = (item.productId.price * item.quantity);
    const discountAmount = (basePrice * item.discountPercent) / 100;
    return basePrice - discountAmount;
  };

  const handleQuantityChange = (productId: string, color: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const itemKey = `${productId}-${color}`;
    const item = localItems.find(item =>
      item.productId._id === productId && item.color === color
    );

    if (!item) return;

    const finalPrice = calculateFinalPrice({ ...item, quantity: newQuantity });
    const updatedItems = localItems.map(item =>
      (item.productId._id === productId && item.color === color)
        ? { ...item, quantity: newQuantity, finalPrice }
        : item
    );

    setLocalItems(updatedItems);
    onUpdateItem(productId, color, { quantity: newQuantity, finalPrice });
  };

  const handleDiscountChange = (productId: string, color: string, discount: number) => {
    if (discount < 0 || discount > 100) return;

    const item = localItems.find(item =>
      item.productId._id === productId && item.color === color
    );

    if (!item) return;

    const finalPrice = calculateFinalPrice({ ...item, discountPercent: discount });
    const updatedItems = localItems.map(item =>
      (item.productId._id === productId && item.color === color)
        ? { ...item, discountPercent: discount, finalPrice }
        : item
    );

    setLocalItems(updatedItems);
    onUpdateItem(productId, color, { discountPercent: discount, finalPrice });
  };

  const getColorImage = (product: Product<true>, colorName: string) => {
    const colorData = product.colors.find((c: ColorData | undefined) => c?.color === colorName);
    return colorData?.urls?.[0] || product.image;
  };

  const total = localItems.reduce((sum, item) => sum + item.finalPrice, 0);
  const totalItems = localItems.reduce((sum, item) => sum + item.quantity, 0);

  const handlePrintBill = () => {
    setDialogOpen(true);
  };

  const validateCustomerInfo = () => {
    if (!customerInfo.customerName.trim()) {
      toast('Error', { description: 'Customer name is required' });
      return false;
    }
    if (!customerInfo.phoneNumber.trim()) {
      toast('Error', { description: 'Phone number is required' });
      return false;
    }
    if (customerInfo.phoneNumber.length < 10) {
      toast('Error', { description: 'Please enter a valid phone number' });
      return false;
    }
    return true;
  };

  const handleAddToOrder = () => {
    if (!validateCustomerInfo()) return;
    setDialogOpen(false);
    onAddToOrder(localItems, customerInfo);
    setCustomerInfo({
      customerName: '',
      phoneNumber: '',
      mode: ORDER_MODE.offline,
      paymentMode: ORDER_PAYMENT_MODE.Cash,
    });
  };

  const handleJustPrintBill = () => {
    if (!validateCustomerInfo()) return;
    setDialogOpen(false);
    onPrintBill(localItems, customerInfo);
    setCustomerInfo({
      customerName: '',
      phoneNumber: '',
      mode: ORDER_MODE.offline,
      paymentMode: ORDER_PAYMENT_MODE.Cash,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bill Summary</h2>
            {localItems.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {totalItems} item{totalItems !== 1 ? 's' : ''} • ₹{total.toFixed(2)}
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-200">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {localItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No items in bill</h3>
              <p className="text-gray-500">Add products to get started with your bill</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {localItems.map((item, index) => (
                <Card key={`${item.productId._id}-${item.color}-${index}`} className="border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
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
                        <div className="mb-3">
                          <h4 className="font-semibold text-gray-900 truncate text-sm">
                            {item.productId.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              ₹{item.productId.price.toFixed(2)} each
                            </span>
                            <Badge variant="outline" className="text-xs px-2 py-0">
                              Art: {item.productId.articleNo}
                            </Badge>
                          </div>
                          {item.color && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {item.color}
                            </Badge>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mb-3">
                          <Label className="text-xs font-medium text-gray-600">Qty:</Label>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleQuantityChange(
                                item.productId._id!,
                                item.color || '',
                                item.quantity - 1
                              )}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-semibold w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleQuantityChange(
                                item.productId._id!,
                                item.color || '',
                                item.quantity + 1
                              )}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Discount Input */}
                        <div className="mb-3">
                          <Label className="text-xs font-medium text-gray-600">Discount %:</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discountPercent}
                            onChange={(e) => handleDiscountChange(
                              item.productId._id!,
                              item.color || '',
                              parseFloat(e.target.value) || 0
                            )}
                            className="h-8 text-sm mt-1"
                            placeholder="0"
                          />
                        </div>

                        {/* Price Breakdown & Actions */}
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <div className="text-xs text-gray-500">
                              ₹{(item.productId.price * item.quantity).toFixed(2)}
                              {item.discountPercent > 0 && (
                                <span className="text-green-600 ml-1">
                                  (-{item.discountPercent}%)
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-bold text-gray-900">
                              Total: ₹{item.finalPrice.toFixed(2)}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveItem(item.productId._id!, item.color || '')}
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
          <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-4">
            {/* Total Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  ₹{localItems.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Discount:</span>
                <span className="font-medium text-green-600">
                  -₹{(localItems.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0) - total).toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">Final Total:</span>
                <span className="text-xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handlePrintBill}
                className="w-full bg-black hover:bg-gray-800 text-white h-12 font-semibold"
              >
                <Printer className="h-4 w-4 mr-2" />
                Process Bill
              </Button>
              <Button
                variant="outline"
                onClick={onClearBill}
                className="w-full border-red-200 text-red-600 hover:bg-red-50 h-10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Items
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Info & Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center">
              <User className="h-5 w-5 mr-2" />
              Customer Information
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="customerName" className="text-sm font-medium">
                Customer Name *
              </Label>
              <Input
                id="customerName"
                value={customerInfo.customerName}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
                className="mt-1"
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
                className="mt-1"
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

          <DialogFooter className="flex flex-col gap-3">
            <Button
              onClick={handleAddToOrder}
              className="w-full bg-black hover:bg-gray-800 text-white h-11"
            >
              <Package className="h-4 w-4 mr-2" />
              Add to Order & Print Bill
            </Button>
            <Button
              variant="outline"
              onClick={handleJustPrintBill}
              className="w-full border-gray-300 hover:bg-gray-50 h-11"
            >
              <Printer className="h-4 w-4 mr-2" />
              Just Print Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}