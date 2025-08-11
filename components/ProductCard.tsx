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
import { ShoppingCart, Tag, Package, Building2, Calendar, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product<true>;
  onAddToBill: (product: Product<true>, selectedColor: ColorData, selectedSize: string, quantity: number) => void;
}

interface BillItem {
  product: Product<true>;
  color: ColorData;
  size: string;
  quantity: number;
}

export function ProductCard({ product, onAddToBill }: ProductCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Get selected color data
  const selectedColor = product.colors[selectedColorIndex];
  const availableSizes = selectedColor?.availableSize && selectedColor?.availableSize?.length > 0
    ? selectedColor.availableSize
    : product.sizes;

  // Handle color selection
  const handleColorSelect = (colorIndex: number) => {
    setSelectedColorIndex(colorIndex);
    setCurrentImageIndex(0);
    setSelectedSize(''); // Reset size when color changes
  };

  // Handle add to bill
  const handleAddToBill = () => {
    if (!selectedSize) {
      toast('Error', { description: 'Please select a size' });
      return;
    }

    if (quantity < 1) {
      toast('Error', { description: 'Quantity must be at least 1' });
      return;
    }

    if (!selectedColor) return

    onAddToBill(product, selectedColor, selectedSize, quantity);
    setIsDialogOpen(false);
    setSelectedSize('');
    setQuantity(1);
    setSelectedColorIndex(0);
    setCurrentImageIndex(0);

    toast('Success', {
      description: `Added ${product.name} (${selectedColor.color}, ${selectedSize}) to bill`
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get display image - prioritize color images over main image
  const displayImage = selectedColor?.urls && selectedColor?.urls?.length > 0
    ? selectedColor.urls[currentImageIndex]
    : product.image;

  return (
    <>
      <Card className="group overflow-hidden border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-xl bg-white">
        {/* Product Image Section */}
        <div className="relative h-64 overflow-hidden bg-gray-50">
          <Image
            src={displayImage}
            alt={`${product.name} - ${selectedColor?.color || 'Main'}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback to product main image if color image fails
              e.currentTarget.src = product.image;
            }}
          />

          {/* Stock Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={product.inStock ? "default" : "destructive"} className="text-xs">
              {product.inStock ? "In Stock" : "Out of Stock"}
            </Badge>
          </div>

          {/* Image Navigation for Color Images */}
          {selectedColor?.urls && selectedColor?.urls?.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                {selectedColor.urls.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight">
              {product.name}
            </h3>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Art. {product.articleNo}
              </p>
              <p className="text-2xl font-bold text-black">
                ₹{product.price.toFixed(2)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-3 space-y-3">
          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Company Info */}
          {typeof product.companyId === 'object' && (
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{product.companyId.name}</span>
            </div>
          )}

          {/* Category */}
          {typeof product.categoryId === 'object' && (
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{product.categoryId.name}</span>
            </div>
          )}

          {/* Available Colors Preview */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium">Available Colors:</p>
            <div className="flex flex-wrap gap-1">
              {product.colors.slice(0, 4).map((color, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs px-2 py-1"
                >
                  {color?.color}
                </Badge>
              ))}
              {product.colors.length > 4 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{product.colors.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          {/* Available Sizes Preview */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium">Sizes:</p>
            <div className="flex flex-wrap gap-1">
              {product.sizes.slice(0, 6).map((size, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-1"
                >
                  {size}
                </Badge>
              ))}
              {product.sizes.length > 6 && (
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  +{product.sizes.length - 6}
                </Badge>
              )}
            </div>
          </div>

          {/* Tag */}
          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-medium">Tag:</p>
              <div className="flex flex-wrap gap-1">
                {product.tags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs px-2 py-1 text-blue-600 border-blue-200"
                  >
                    <Tag className="h-2 w-2 mr-1" />
                    {typeof tag === 'object' ? tag.name : tag}
                  </Badge>
                ))}
                {product.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-1 text-blue-600 border-blue-200">
                    +{product.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Created Date */}
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              Added {formatDate(product.createdAt || '')}
            </span>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full bg-black hover:bg-gray-800 text-white transition-all duration-200 hover:shadow-lg"
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.inStock ? 'Add to Bill' : 'Out of Stock'}
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden">
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {product.name}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Select your preferred color, size, and quantity
                </DialogDescription>
              </DialogHeader>

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
                            className={`group relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${selectedColorIndex === index
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

                            {/* Selection Indicator */}
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
                            className={`p-3 border-2 rounded-lg font-medium transition-all duration-200 ${selectedSize === size
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
                      <Button
                        className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-200"
                        onClick={handleAddToBill}
                        disabled={!selectedSize || !selectedColor}
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Add to Bill • ₹{(product.price * quantity).toFixed(2)}
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full h-12 font-semibold rounded-lg"
                        onClick={() => setIsDialogOpen(false)}
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
                              <span className="w-3 h-3 bg-gray-600 rounded-full"></span>
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
          </Dialog>
        </CardFooter>
      </Card>
    </>
  );
}