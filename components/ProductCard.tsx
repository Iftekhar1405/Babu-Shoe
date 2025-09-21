'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product, ColorData } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Tag, Package, Building2, Calendar, Check, Loader2, Heart, Share, Eye, Plus, Minus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-hooks';
import { useAddToBill, useOptimisticBillUpdates } from '@/lib/api-advance';
import { useScreenSize } from '@/context/Screen-size-context';

interface ProductCardProps {
  product: Product<true>;
  showAddToBill?: boolean;
}

export function ProductCard({ product, showAddToBill = true }: ProductCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const { isAuthenticated } = useAuth();
  const { isMobile, isTablet } = useScreenSize();
  const addToBillMutation = useAddToBill();
  const optimisticUpdates = useOptimisticBillUpdates();

  // Get selected color data
  const selectedColor = product.colors[selectedColorIndex];
  const availableSizes = selectedColor?.availableSize && selectedColor?.availableSize?.length > 0
    ? selectedColor.availableSize
    : product.sizes;

  // Handle color selection
  const handleColorSelect = (colorIndex: number) => {
    setSelectedColorIndex(colorIndex);
    setCurrentImageIndex(0);
    setSelectedSize('');
  };

  // Handle add to bill with API integration
  const handleAddToBill = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to bill');
      return;
    }

    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }

    const billData = {
      productId: product._id!,
      quantity,
      size: selectedSize,
      color: selectedColor.color,
      discountPercent: 0,
      salesPerson: undefined,
    };

    try {
      const optimisticItem = {
        productId: product,
        quantity,
        color: selectedColor.color,
        size: selectedSize,
        discountPercent: 0,
      };
      optimisticUpdates.addItemOptimistically(optimisticItem as any);

      await addToBillMutation.mutateAsync(billData);

      toast.success('Added to Bill', {
        description: `${product.name} (${selectedColor.color}, ${selectedSize}) added successfully`,
      });

      setIsDialogOpen(false);
      setSelectedSize('');
      setQuantity(1);
      setSelectedColorIndex(0);
      setCurrentImageIndex(0);

    } catch (error) {
      optimisticUpdates.removeItemOptimistically(product._id!, selectedColor.color || '');
      console.error('Failed to add to bill:', error);
      toast.error('Failed to add to bill', {
        description: 'Please try again',
      });
    }
  };

  // Quick add to bill for mobile
  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to bill');
      return;
    }

    if (product.colors.length > 1 || product.sizes.length > 1) {
      setIsDialogOpen(true);
      return;
    }

    // Auto-select if only one option
    const billData = {
      productId: product._id!,
      quantity: 1,
      size: product.sizes[0] || 'One Size',
      color: product.colors[0]?.color || 'Default',
      discountPercent: 0,
      salesPerson: undefined,
    };

    try {
      await addToBillMutation.mutateAsync(billData);
      toast.success('Added to Bill');
    } catch (error) {
      toast.error('Failed to add to bill');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const displayImage = selectedColor?.urls && selectedColor?.urls?.length > 0
    ? selectedColor.urls[currentImageIndex]
    : product.image;

  return (
    <>
      <Card 
        className={`group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-2xl ${isMobile ? 'shadow-md' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image Section */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={displayImage}
            alt={`${product.name} - ${selectedColor?.color || 'Main'}`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={(e) => {
              e.currentTarget.src = product.image;
            }}
          />

          {/* Gradient Overlay for Mobile */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 ${isHovered || isMobile ? 'opacity-100' : ''}`} />

          {/* Top Badges */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            <Badge 
              variant={product.inStock ? "default" : "destructive"} 
              className={`text-xs font-medium ${isMobile ? 'px-2 py-1' : 'px-3 py-1'} backdrop-blur-sm bg-white/90 text-black border-0 shadow-sm`}
            >
              {product.inStock ? "In Stock" : "Out of Stock"}
            </Badge>

            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFavorited(!isFavorited);
                toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
              }}
              className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                isFavorited 
                  ? 'bg-red-500 text-white shadow-md' 
                  : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
              } ${isMobile || isHovered ? 'opacity-100' : 'opacity-0'}`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Quick Action Buttons - Desktop Hover */}
          {!isMobile && (
            <div className={`absolute top-2 right-12 space-y-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDialogOpen(true);
                }}
                className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-black transition-all duration-200 shadow-sm"
              >
                <Eye className="h-4 w-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigator.share?.({ 
                    title: product.name, 
                    url: window.location.href 
                  }) || toast.success('Link copied to clipboard');
                }}
                className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-black transition-all duration-200 shadow-sm"
              >
                <Share className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Price Tag - Mobile */}
          {isMobile && (
            <div className="absolute bottom-2 left-2">
              <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <p className="text-lg font-bold text-black">₹{product.price.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Quick Add Button - Mobile */}
          {isMobile && showAddToBill && isAuthenticated && (
            <button
              onClick={handleQuickAdd}
              disabled={!product.inStock || addToBillMutation.isPending}
              className="absolute bottom-2 right-2 p-3 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-all duration-200 disabled:bg-gray-400"
            >
              {addToBillMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ShoppingCart className="h-5 w-5" />
              )}
            </button>
          )}

          {/* Image Navigation */}
          {selectedColor?.urls && selectedColor.urls.length > 1 && !isMobile && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(
                    currentImageIndex === 0 ? selectedColor.urls!.length - 1 : currentImageIndex - 1
                  );
                }}
                className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-all duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(
                    currentImageIndex === selectedColor.urls!.length - 1 ? 0 : currentImageIndex + 1
                  );
                }}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-all duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Image Indicators */}
          {selectedColor?.urls && selectedColor.urls.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                {selectedColor.urls.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <CardHeader className={`p-3 ${isMobile ? 'pb-2' : 'pb-3'}`}>
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className={`font-bold text-gray-900 line-clamp-2 leading-tight ${isMobile ? 'text-sm' : 'text-base'}`}>
                {product.name}
              </h3>
              {!isMobile && (
                <p className="text-xl font-bold text-black ml-2 flex-shrink-0">
                  ₹{product.price.toFixed(2)}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Art. {product.articleNo}
              </p>
              {typeof product.categoryId === 'object' && (
                <Badge variant="outline" className={`${isMobile ? 'text-xs px-2 py-0.5' : 'text-xs px-2 py-1'}`}>
                  {product.categoryId.name}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className={`px-3 ${isMobile ? 'py-2' : 'py-3'} space-y-2`}>
          {/* Description */}
          {product.description && (
            <p className={`text-gray-600 line-clamp-${isMobile ? '1' : '2'} ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {product.description}
            </p>
          )}

          {/* Colors Preview */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`text-gray-500 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Colors:
              </span>
              <div className="flex space-x-1">
                {product.colors.slice(0, isMobile ? 3 : 4).map((color, index) => (
                  <div
                    key={index}
                    className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} rounded-full border-2 border-gray-200 cursor-pointer hover:scale-110 transition-transform`}
                    style={{ backgroundColor: color?.color?.toLowerCase() || '#gray' }}
                    title={color?.color}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleColorSelect(index);
                    }}
                  />
                ))}
                {product.colors.length > (isMobile ? 3 : 4) && (
                  <div className={`${isMobile ? 'h-4 w-4 text-[10px]' : 'h-5 w-5 text-xs'} rounded-full flex items-center justify-center border-2 border-gray-300 bg-gray-100 text-gray-600 font-medium`}>
                    +{product.colors.length - (isMobile ? 3 : 4)}
                  </div>
                )}
              </div>
            </div>

            {/* Sizes Preview */}
            <div className="flex items-center space-x-1">
              <span className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {product.sizes.slice(0, 3).join(', ')}
                {product.sizes.length > 3 && ` +${product.sizes.length - 3}`}
              </span>
            </div>
          </div>

          {/* Company & Tags - Compact */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            {typeof product.companyId === 'object' && (
              <div className="flex items-center space-x-1">
                <Building2 className="h-3 w-3" />
                <span className="truncate">{product.companyId.name}</span>
              </div>
            )}
            
            {Array.isArray(product.tags) && product.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                <Tag className="h-3 w-3" />
                <span>{product.tags.length} tag{product.tags.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className={`p-3 pt-0 ${isMobile ? 'pt-2' : ''}`}>
          {showAddToBill && isAuthenticated ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className={`w-full bg-black hover:bg-gray-800 text-white transition-all duration-200 hover:shadow-lg ${isMobile ? 'h-10 text-sm' : 'h-11'} rounded-xl font-semibold`}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className={`${isMobile ? 'h-3 w-3 mr-1.5' : 'h-4 w-4 mr-2'}`} />
                  {product.inStock ? 'Add to Bill' : 'Out of Stock'}
                </Button>
              </DialogTrigger>

              {/* Mobile Dialog */}
              {isMobile ? (
                <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
                  <div className="h-[95vh] flex flex-col">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-gray-900 truncate">{product.name}</h2>
                        <p className="text-sm text-gray-500">Select options</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-shrink-0 ml-2"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col">
                      {/* Mobile Image Section */}
                      <div className="h-64 flex-shrink-0 bg-gray-50">
                        <div className="h-full relative bg-white overflow-hidden">
                          <Image
                            src={displayImage}
                            alt={`${product.name} - ${selectedColor?.color || 'Main'}`}
                            fill
                            className="object-cover"
                            priority
                          />

                          {/* Mobile Image Navigation */}
                          {selectedColor?.urls && selectedColor.urls.length > 1 && (
                            <>
                              <button
                                onClick={() => setCurrentImageIndex(
                                  currentImageIndex === 0 ? selectedColor.urls!.length - 1 : currentImageIndex - 1
                                )}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              
                              <button
                                onClick={() => setCurrentImageIndex(
                                  currentImageIndex === selectedColor.urls!.length - 1 ? 0 : currentImageIndex + 1
                                )}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>

                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1">
                                {selectedColor.urls.map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                    }`}
                                  />
                                ))}
                              </div>
                            </>
                          )}

                          {selectedColor && (
                            <div className="absolute top-4 left-4">
                              <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                                {selectedColor.color}
                              </Badge>
                            </div>
                          )}

                          <div className="absolute top-4 right-4">
                            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm font-bold">
                              ₹{product.price.toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Options Section */}
                      <div className="flex-1 overflow-y-auto bg-white">
                        <div className="p-4 space-y-6">
                          {/* Color Selection */}
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-gray-900">
                              Color ({product.colors.length} available)
                            </Label>

                            <div className="grid grid-cols-1 gap-2">
                              {product.colors.map((color, index) => (
                                <div
                                  key={index}
                                  className={`group relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                                    selectedColorIndex === index
                                      ? 'border-black ring-2 ring-black/20 shadow-md'
                                      : 'border-gray-200 hover:border-gray-400 hover:shadow-sm'
                                  }`}
                                  onClick={() => handleColorSelect(index)}
                                >
                                  {color?.urls && color.urls.length > 0 ? (
                                    <div className="relative h-16 bg-gray-100">
                                      <Image
                                        src={color.urls[0]}
                                        alt={color.color || 'gray'}
                                        fill
                                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                                      />
                                    </div>
                                  ) : (
                                    <div className="h-16 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                      <div
                                        className="w-8 h-8 rounded-full border border-gray-300"
                                        style={{ backgroundColor: color?.color?.toLowerCase() || '#gray' }}
                                      />
                                    </div>
                                  )}

                                  <div className="p-2 bg-white">
                                    <p className="font-medium text-gray-900 truncate text-xs">
                                      {color?.color}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                      {color?.urls?.length || 0} image{(color?.urls?.length || 0) !== 1 ? 's' : ''}
                                    </p>
                                  </div>

                                  {selectedColorIndex === index && (
                                    <div className="absolute top-2 right-2">
                                      <div className="bg-black text-white rounded-full p-1 shadow-lg">
                                        <Check className="h-3 w-3" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Size Selection */}
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-gray-900">
                              Size ({availableSizes.length} available)
                            </Label>

                            <div className="grid grid-cols-3 gap-2">
                              {availableSizes.map((size) => (
                                <button
                                  key={size}
                                  onClick={() => setSelectedSize(size)}
                                  className={`p-2 text-sm border-2 rounded-lg font-medium transition-all duration-200 ${
                                    selectedSize === size
                                      ? 'border-black bg-black text-white shadow-md'
                                      : 'border-gray-200 hover:border-gray-400 hover:shadow-sm bg-white'
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Quantity Selection */}
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-gray-900">Quantity</Label>
                            <div className="flex items-center justify-center p-3 border-2 border-gray-200 rounded-lg bg-gray-50">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                                className="h-8 w-8 p-0 rounded-full bg-white"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>

                              <div className="mx-6 text-center">
                                <span className="text-xl font-bold">{quantity}</span>
                                <p className="text-xs text-gray-500">pieces</p>
                              </div>

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setQuantity(quantity + 1)}
                                className="h-8 w-8 p-0 rounded-full bg-white"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Price Summary */}
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Unit Price:</span>
                                <span className="font-medium">₹{product.price.toFixed(2)}</span>
                              </div>

                              {quantity > 1 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Quantity:</span>
                                  <span className="font-medium">× {quantity}</span>
                                </div>
                              )}

                              <div className="border-t border-gray-300 pt-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-gray-900">Total:</span>
                                  <span className="text-xl font-bold text-black">
                                    ₹{(product.price * quantity).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Selection Validation */}
                          {!selectedSize && (
                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                              <p className="text-sm text-amber-700 font-medium">
                                Please select a size before adding to bill.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sticky Bottom Actions - Mobile */}
                    <div className="border-t bg-white p-4 space-y-3">
                      <Button
                        className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-200"
                        onClick={handleAddToBill}
                        disabled={!selectedSize || !selectedColor || addToBillMutation.isPending}
                      >
                        {addToBillMutation.isPending ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-5 w-5 mr-2" />
                            Add to Bill • ₹{(product.price * quantity).toFixed(2)}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              ) : (
                /* Desktop Dialog - Original Layout */
                <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden">
                  <div className="flex h-[600px] overflow-hidden">
                    {/* Left Side - Image Preview */}
                    <div className="flex-1 p-6 bg-gray-50 border-r overflow-y-auto">
                      <div className="space-y-4 h-full">
                        {/* Main Image Display */}
                        <div className="relative h-96 bg-white rounded-lg overflow-hidden shadow-sm border">
                          <Image
                            src={displayImage}
                            alt={`${product.name} - ${selectedColor?.color || 'Main'}`}
                            fill
                            className="object-cover"
                            priority
                          />

                          {/* Color Badge */}
                          {selectedColor && (
                            <div className="absolute top-4 left-4">
                              <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                                {selectedColor.color}
                              </Badge>
                            </div>
                          )}

                          {/* Image Counter */}
                          {selectedColor?.urls && selectedColor?.urls?.length > 1 && (
                            <div className="absolute top-4 right-4">
                              <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                                {currentImageIndex + 1} / {selectedColor?.urls?.length}
                              </Badge>
                            </div>
                          )}

                          {/* Navigation Arrows */}
                          {selectedColor?.urls && selectedColor?.urls?.length > 1 && (
                            <>
                              <button
                                onClick={() => setCurrentImageIndex(
                                  currentImageIndex === 0 && selectedColor.urls ? selectedColor?.urls?.length - 1 : currentImageIndex - 1
                                )}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setCurrentImageIndex(
                                  selectedColor.urls && currentImageIndex === selectedColor.urls.length - 1 ? 0 : currentImageIndex + 1
                                )}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {selectedColor && selectedColor.urls && selectedColor?.urls?.length > 1 && (
                          <div className="flex space-x-2 overflow-x-auto pb-2">
                            {selectedColor.urls.map((url, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                                  ? 'border-black ring-2 ring-black/20'
                                  : 'border-gray-200 hover:border-gray-400'
                                  }`}
                              >
                                <Image
                                  src={url}
                                  alt={`${selectedColor.color} ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Product Info */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-500">Article: {product.articleNo}</p>
                              <p className="text-sm text-gray-500">
                                Category: {typeof product.categoryId === 'object' ? product.categoryId.name : 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-black">₹{product.price.toFixed(2)}</p>
                              <Badge variant={product.inStock ? "default" : "destructive"} className="mt-1">
                                {product.inStock ? "In Stock" : "Out of Stock"}
                              </Badge>
                            </div>
                          </div>

                          {product.description && (
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Selection Options */}
                    <div className="w-96 p-6 overflow-y-auto">
                      <div className="space-y-6">
                        {/* Color Selection */}
                        <div className="space-y-4">
                          <div>
                            <Label className="text-base font-semibold text-gray-900">
                              Color ({product.colors.length} available)
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                              {selectedColor ? `Selected: ${selectedColor.color}` : 'Choose a color'}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {product.colors.map((color, index) => (
                              <div
                                key={index}
                                className={`group relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                                  selectedColorIndex === index
                                    ? 'border-black ring-2 ring-black/20 shadow-md'
                                    : 'border-gray-200 hover:border-gray-400 hover:shadow-sm'
                                }`}
                                onClick={() => handleColorSelect(index)}
                              >
                                {color && color.urls && color.urls?.length > 0 ? (
                                  <div className="relative h-24 bg-gray-100">
                                    <Image
                                      src={color.urls[0]}
                                      alt={color.color || 'gray'}
                                      fill
                                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-1"></div>
                                      <span className="text-xs text-gray-400">No Image</span>
                                    </div>
                                  </div>
                                )}

                                <div className="p-3 bg-white">
                                  <p className="font-medium text-sm text-gray-900 truncate">
                                    {color?.color}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {color?.urls?.length || 0} image{(color?.urls?.length || 0) !== 1 ? 's' : ''}
                                  </p>
                                </div>

                                {selectedColorIndex === index && (
                                  <div className="absolute top-2 right-2">
                                    <div className="bg-black text-white rounded-full p-1 shadow-lg">
                                      <Check className="h-3 w-3" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Size Selection */}
                        <div className="space-y-4">
                          <div>
                            <Label className="text-base font-semibold text-gray-900">
                              Size ({availableSizes.length} available)
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                              {selectedSize ? `Selected: ${selectedSize}` : 'Choose a size'}
                            </p>
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            {availableSizes.map((size) => (
                              <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`p-3 border-2 rounded-lg font-medium transition-all duration-200 ${
                                  selectedSize === size
                                    ? 'border-black bg-black text-white shadow-md'
                                    : 'border-gray-200 hover:border-gray-400 hover:shadow-sm bg-white'
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Quantity Selection */}
                        <div className="space-y-4">
                          <Label className="text-base font-semibold text-gray-900">Quantity</Label>
                          <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setQuantity(Math.max(1, quantity - 1))}
                              disabled={quantity <= 1}
                              className="h-10 w-10 p-0"
                            >
                              -
                            </Button>

                            <div className="text-center">
                              <span className="text-xl font-bold">{quantity}</span>
                              <p className="text-xs text-gray-500">pieces</p>
                            </div>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setQuantity(quantity + 1)}
                              className="h-10 w-10 p-0"
                            >
                              +
                            </Button>
                          </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Unit Price:</span>
                              <span className="font-medium">₹{product.price.toFixed(2)}</span>
                            </div>

                            {quantity > 1 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Quantity:</span>
                                <span className="font-medium">× {quantity}</span>
                              </div>
                            )}

                            <div className="border-t pt-2">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-900">Total:</span>
                                <span className="text-2xl font-bold text-black">
                                  ₹{(product.price * quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-4 border-t">
                          {!selectedSize && (
                            <p className="text-sm text-red-500 mb-2">
                              Please select a size before adding to bill.
                            </p>
                          )}

                          <Button
                            className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-200"
                            onClick={handleAddToBill}
                            disabled={!selectedSize || !selectedColor || addToBillMutation.isPending}
                          >
                            {addToBillMutation.isPending ? (
                              <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="h-5 w-5 mr-2" />
                                Add to Bill • ₹{(product.price * quantity).toFixed(2)}
                              </>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            className="w-full h-12 font-semibold rounded-lg"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={addToBillMutation.isPending}
                          >
                            Continue Shopping
                          </Button>
                        </div>

                        {/* Selection Summary */}
                        {(selectedColor || selectedSize) && (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="text-sm font-medium text-gray-900 mb-1">Your Selection:</p>
                            <div className="text-sm text-gray-800 space-y-1">
                              {selectedColor && (
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: selectedColor.color?.toLowerCase() || '#gray' }}
                                  />
                                  <span>Color: {selectedColor.color}</span>
                                </div>
                              )}
                              {selectedSize && (
                                <div className="flex items-center space-x-2">
                                  <span className="w-3 h-3 bg-gray-600 rounded-full"></span>
                                  <span>Size: {selectedSize}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <span className="w-3 h-3 bg-gray-600 rounded-full"></span>
                                <span>Quantity: {quantity}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              )}
            </Dialog>
          ) : !isAuthenticated ? (
            <Button
              className={`w-full bg-gray-100 text-gray-600 cursor-not-allowed ${isMobile ? 'h-10 text-sm' : 'h-11'} rounded-xl font-medium`}
              disabled
            >
              Sign in to Add to Bill
            </Button>
          ) : (
            <Button
              className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-200 ${isMobile ? 'h-10 text-sm' : 'h-11'} rounded-xl font-semibold shadow-md hover:shadow-lg`}
              onClick={() => setIsDialogOpen(true)}
            >
              <Eye className={`${isMobile ? 'h-3 w-3 mr-1.5' : 'h-4 w-4 mr-2'}`} />
              View Details
            </Button>
          )}
        </CardFooter>

        {/* Mobile Quick Actions Overlay */}
        {isMobile && (
          <div className="absolute top-2 right-2 space-y-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigator.share?.({ 
                  title: product.name, 
                  url: window.location.href 
                }) || toast.success('Product shared');
              }}
              className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-black transition-all duration-200 shadow-sm"
            >
              <Share className="h-4 w-4" />
            </button>
          </div>
        )}
      </Card>
    </>
  );
}