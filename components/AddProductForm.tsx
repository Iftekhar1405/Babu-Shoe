'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Upload, Loader2, Check, Image as ImageIcon } from 'lucide-react';
import { Category } from '@/types';
import { apiClient } from '@/lib/api';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Name too long'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  categoryId: z.string().min(1, 'Please select a category'),
  articleNo: z.string().min(1, 'Article number is required').max(50, 'Article number too long'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ColorData {
  id: string;
  colorName: string;
  urls: string[];
  isUploading: boolean;
}

interface AddProductFormProps {
  onSuccess: () => void;
}

export function AddProductForm({ onSuccess }: AddProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<ColorData[]>([
    { id: '1', colorName: '', urls: [], isUploading: false }
  ]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiClient.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const addColorSection = () => {
    const newId = Date.now().toString();
    setColors(prev => [...prev, {
      id: newId,
      colorName: '',
      urls: [],
      isUploading: false
    }]);
  };

  const removeColorSection = (id: string) => {
    setColors(prev => prev.filter(item => item.id !== id));
  };

  const updateColorName = (id: string, colorName: string) => {
    setColors(prev => prev.map(item =>
      item.id === id ? { ...item, colorName } : item
    ));
  };

  const uploadImages = async (colorId: string, files: FileList) => {
    const colorData = colors.find(c => c.id === colorId);
    if (!colorData || !colorData.colorName.trim()) {
      alert('Please enter a color name before uploading images');
      return;
    }

    // Set uploading state
    setColors(prev => prev.map(item =>
      item.id === colorId ? { ...item, isUploading: true } : item
    ));

    try {
      const formData = new FormData();

      // Add all selected files
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      // Add color name
      formData.append('color', colorData.colorName.trim());

      const response = await fetch('http://localhost:8080/api/upload/images-legacy', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      const uploadedUrls = Array.isArray(result) ? result :
        result.urls ? result.urls :
          result.images ? result.images : [];

      setColors(prev => prev.map(item =>
        item.id === colorId
          ? { ...item, urls: [...item.urls, ...uploadedUrls], isUploading: false }
          : item
      ));

    } catch (error) {
      console.error('Failed to upload images:', error);
      alert('Failed to upload images. Please try again.');

      setColors(prev => prev.map(item =>
        item.id === colorId ? { ...item, isUploading: false } : item
      ));
    }
  };

  const removeImage = (colorId: string, urlIndex: number) => {
    setColors(prev => prev.map(item =>
      item.id === colorId
        ? { ...item, urls: item.urls.filter((_, index) => index !== urlIndex) }
        : item
    ));
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const validColors = colors
        .filter(color => color.colorName.trim() && color.urls.length > 0)
        .map(color => ({
          color: color.colorName.trim(),
          urls: color.urls
        }));

      const productData = {
        ...data,
        colors: validColors
      };
      console.log("🪵 ~ onSubmit ~ productData:", productData)

      await apiClient.createProduct(productData);

      reset();
      setColors([{ id: '1', colorName: '', urls: [], isUploading: false }]);
      onSuccess();
    } catch (error) {
      console.error('Failed to create product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-gray-900">Add New Product</CardTitle>
          <p className="text-gray-600 mt-1">Create a new product with multiple color variants</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Product Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Product Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter product name"
                  className="h-11 border-gray-200 focus:border-black-500 focus:ring-2 focus:ring-black-200 transition-all"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="articleNo" className="text-sm font-semibold text-gray-700">Article Number</Label>
                <Input
                  id="articleNo"
                  {...register('articleNo')}
                  placeholder="Enter article number"
                  className="h-11 border-gray-200 focus:border-black-500 focus:ring-2 focus:ring-black-200 transition-all"
                />
                {errors.articleNo && (
                  <p className="text-red-500 text-xs mt-1">{errors.articleNo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-semibold text-gray-700">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                  className="h-11 border-gray-200 focus:border-black-500 focus:ring-2 focus:ring-black-200 transition-all"
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Category</Label>
                <Select onValueChange={(value) => setValue('categoryId', value)}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-black-500 focus:ring-2 focus:ring-black-200 transition-all">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id || ''}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Product Images Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
                  <p className="text-sm text-gray-600">Add images for each color variant</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addColorSection}
                  className="flex items-center space-x-2 border-black-200 text-black-600 hover:bg-black-50 hover:border-black-300"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Color</span>
                </Button>
              </div>

              <div className="space-y-4">
                {colors.map((colorData, index) => (
                  <Card key={colorData.id} className="border border-gray-200 bg-gray-50/30">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Color Name and Remove Button */}
                        <div className="flex items-start space-x-4">
                          <div className="flex-1">
                            <Label htmlFor={`color-${colorData.id}`} className="text-sm font-medium text-gray-700">
                              Color Name
                            </Label>
                            <Input
                              id={`color-${colorData.id}`}
                              value={colorData.colorName}
                              onChange={(e) => updateColorName(colorData.id, e.target.value)}
                              placeholder="e.g., Midnight Black, Ocean black"
                              className="mt-1 h-10 border-gray-200 focus:border-black-500 focus:ring-1 focus:ring-black-200"
                            />
                          </div>
                          {colors.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeColorSection(colorData.id)}
                              className="mt-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {/* Upload Section */}
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <label
                              htmlFor={`images-${colorData.id}`}
                              className={`flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors ${colorData.isUploading ? 'opacity-50 cursor-not-allowed' : ''
                                } ${!colorData.colorName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex items-center space-x-2">
                                {colorData.isUploading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 text-black-500 animate-spin" />
                                    <span className="text-sm text-black-600 font-medium">Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <ImageIcon className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">
                                      {colorData.colorName ? `Upload images for ${colorData.colorName}` : 'Enter color name first'}
                                    </span>
                                    <Upload className="w-4 h-4 text-gray-400" />
                                  </>
                                )}
                              </div>
                              <input
                                id={`images-${colorData.id}`}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                disabled={colorData.isUploading || !colorData.colorName.trim()}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    uploadImages(colorData.id, e.target.files);
                                    e.target.value = '';
                                  }
                                }}
                              />
                            </label>
                          </div>

                          {colorData.urls.length > 0 && (
                            <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                              <Check className="w-4 h-4" />
                              <span className="text-sm font-medium">{colorData.urls.length} uploaded</span>
                            </div>
                          )}
                        </div>

                        {/* Uploaded Images Preview */}
                        {colorData.urls.length > 0 && (
                          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 pt-2">
                            {colorData.urls.map((url, imgIndex) => (
                              <div key={imgIndex} className="relative group">
                                <img
                                  src={url}
                                  alt={`${colorData.colorName} ${imgIndex + 1}`}
                                  className="w-full h-12 object-cover rounded-md border border-gray-200 shadow-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(colorData.id, imgIndex)}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-black-600 to-black-700 hover:from-black-700 hover:to-black-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Product...</span>
                  </div>
                ) : (
                  'Create Product'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}