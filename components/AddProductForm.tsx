'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import CreatableSelect from 'react-select/creatable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Upload, Loader2, Check, Image as ImageIcon } from 'lucide-react';
import { useCategories, useCreateProduct } from '@/lib/api-advance';
import { Product, ColorData } from '@/types';
import { toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Name too long'),
  image: z.string().min(1, 'Main product image is required'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  categoryId: z.string().min(1, 'Please select a category'),
  articleNo: z.string().min(1, 'Article number is required').max(50, 'Article number too long'),
  companyId: z.string().min(1, 'Company is required'),
  sizes: z.array(z.string()).min(1, 'At least one size is required'),
  inStock: z.boolean().default(true),
  tags: z.array(z.string()).optional().default([])
});

type ProductFormData = z.infer<typeof productSchema>;

interface ColorFormData {
  id: string;
  colorName: string;
  urls: string[];
  isUploading: boolean;
  availableSize: string[];
}

interface AddProductFormProps {
  onSuccess: () => void;
}

export function AddProductForm({ onSuccess }: AddProductFormProps) {
  const [colors, setColors] = useState<ColorFormData[]>([
    { id: '1', colorName: '', urls: [], isUploading: false, availableSize: [] }
  ]);
  const [tagOptions, setTagOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<{ label: string; value: string }[]>([]);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [isUploadingMainImage, setIsUploadingMainImage] = useState<boolean>(false);

  const { data: categories } = useCategories();
  const { mutate, isPending: isSubmitting } = useCreateProduct({
    onSuccess: () => {
      onSuccess();
      reset();
      setColors([{ id: '1', colorName: '', urls: [], isUploading: false, availableSize: [] }]);
      setSelectedTags([]);
      setMainImageUrl('');
    },
    onError: (err) => {
      toast('Something went wrong', { description: err.message })
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      inStock: true,
      sizes: [],
      image: '',
      description: '',
      tags: [],
    }
  });

  const uploadMainImage = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setIsUploadingMainImage(true);

    try {
      const formData = new FormData();
      formData.append('images', files[0]); // Only upload first file for main image
      formData.append('color', 'main'); // Use 'main' as identifier for main image

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

      if (uploadedUrls.length > 0) {
        const imageUrl = uploadedUrls[0];
        setMainImageUrl(imageUrl);
        setValue('image', imageUrl);
        toast('Success', { description: 'Main image uploaded successfully' });
      }

    } catch (error) {
      console.error('Failed to upload main image:', error);
      toast('Error', { description: 'Failed to upload main image. Please try again.' });
    } finally {
      setIsUploadingMainImage(false);
    }
  };

  const addColorSection = () => {
    const newId = Date.now().toString();
    setColors(prev => [...prev, {
      id: newId,
      colorName: '',
      urls: [],
      isUploading: false,
      availableSize: []
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

  const updateAvailableSizes = (id: string, sizes: string) => {
    setColors(prev => prev.map(item =>
      item.id === id ? { ...item, availableSize: sizes.split(',').map(s => s.trim()).filter(s => s.length > 0) } : item
    ));
  };

  const uploadImages = async (colorId: string, files: FileList) => {
    const colorData = colors.find(c => c.id === colorId);
    if (!colorData || !colorData.colorName.trim()) {
      toast('Error', { description: 'Please enter a color name before uploading images' });
      return;
    }

    setColors(prev => prev.map(item =>
      item.id === colorId ? { ...item, isUploading: true } : item
    ));

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });
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

      toast('Success', { description: 'Images uploaded successfully' });

    } catch (error) {
      console.error('Failed to upload images:', error);
      toast('Error', { description: 'Failed to upload images. Please try again.' });
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
    console.log('Form data:', data);
    console.log('Colors data:', colors);

    // Validate that we have at least one color with images
    const validColors = colors.filter(color => color.colorName.trim() && color.urls.length > 0);

    if (validColors.length === 0) {
      toast('Error', { description: 'Please add at least one color with images' });
      return;
    }

    // Transform colors to match ColorData[] type (not Partial<ColorData[]>)
    const transformedColors: ColorData[] = validColors.map(color => ({
      color: color.colorName.trim(),
      urls: color.urls,
      availableSize: color.availableSize.length > 0 ? color.availableSize : data.sizes, // Use product sizes if color-specific sizes are not provided
    }));

    // Create product data matching Product<false> interface
    const productData: Product<false> = {
      name: data.name,
      image: data.image,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId,
      articleNo: data.articleNo,
      companyId: data.companyId,
      sizes: data.sizes,
      inStock: data.inStock,
      tags: data.tags || [], // Convert undefined to empty array
      colors: transformedColors, // This should be ColorData[], not Partial<ColorData[]>
    };

    console.log("🪵 ~ onSubmit ~ productData:", productData);

    try {
      mutate(productData);
    } catch (error) {
      console.error('Mutation error:', error);
      toast('Error', { description: 'Failed to create product' });
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
              <div>
                <Label>Product Name</Label>
                <Input {...register('name')} placeholder="Enter product name" />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
              </div>

              <div>
                <Label>Article Number</Label>
                <Input {...register('articleNo')} placeholder="Enter article number" />
                {errors.articleNo && <p className="text-red-500 text-xs">{errors.articleNo.message}</p>}
              </div>

              <div className="md:col-span-2">
                <Label>Main Product Image</Label>
                <div className="space-y-2">
                  <label
                    className={`block w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors ${isUploadingMainImage ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingMainImage}
                      onChange={(e) => {
                        if (e.target.files) {
                          uploadMainImage(e.target.files);
                          e.target.value = '';
                        }
                      }}
                    />
                    <div className="flex flex-col items-center space-y-2">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {isUploadingMainImage ? 'Uploading...' : 'Upload Main Product Image'}
                      </span>
                    </div>
                  </label>

                  {mainImageUrl && (
                    <div className="flex items-center space-x-3">
                      <img
                        src={mainImageUrl}
                        alt="Main product"
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <div className="flex-1">
                        <div className="text-green-600 flex items-center space-x-1">
                          <Check className="w-4 h-4" />
                          <span className="text-sm">Main image uploaded successfully</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{mainImageUrl}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMainImageUrl('');
                          setValue('image', '');
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                {errors.image && <p className="text-red-500 text-xs">{errors.image.message}</p>}
              </div>

              <div className="md:col-span-2">
                <Label>Description</Label>
                <textarea
                  {...register('description')}
                  placeholder="Enter product description (minimum 10 characters)"
                  className="w-full p-3 border border-gray-300 rounded-md resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
                {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
              </div>

              <div>
                <Label>Price ($)</Label>
                <Input type="number" step="0.01" {...register('price', { valueAsNumber: true })} placeholder="0.00" />
                {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
              </div>

              <div>
                <Label>Category</Label>
                <Select onValueChange={(value) => setValue('categoryId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category._id} value={category._id || ''}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-red-500 text-xs">{errors.categoryId.message}</p>}
              </div>

              <div>
                <Label>Company ID</Label>
                <Input {...register('companyId')} placeholder="Enter company ID" />
                {errors.companyId && <p className="text-red-500 text-xs">{errors.companyId.message}</p>}
              </div>

              <div>
                <Label>Sizes (comma separated)</Label>
                <Input
                  placeholder="S, M, L"
                  onChange={(e) => {
                    const sizes = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                    setValue('sizes', sizes);
                  }}
                />
                {errors.sizes && <p className="text-red-500 text-xs">{errors.sizes.message}</p>}
              </div>

              <div>
                <Label>In Stock</Label>
                <Select onValueChange={(value) => setValue('inStock', value === 'true')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stock status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tags</Label>
                <CreatableSelect
                  isMulti
                  value={selectedTags}
                  onChange={(newValue: any) => {
                    const tags = newValue || [];
                    setSelectedTags(tags);
                    setValue('tags', tags.map((v: any) => v.value));
                  }}
                  options={tagOptions}
                  onCreateOption={(inputValue: string) => {
                    const newOption = { label: inputValue, value: inputValue };
                    setTagOptions(prev => [...prev, newOption]);
                    const newTags = [...selectedTags, newOption];
                    setSelectedTags(newTags);
                    setValue('tags', newTags.map(t => t.value));
                  }}
                  placeholder="Add tags..."
                />
                {errors.tags && <p className="text-red-500 text-xs">{errors.tags.message}</p>}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Product Images Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Product Images</h3>
                  <p className="text-sm text-gray-600">Add images for each color variant</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addColorSection}>
                  <Plus className="h-4 w-4" /> Add Color
                </Button>
              </div>

              {colors.map((colorData) => (
                <Card key={colorData.id} className="border">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <Label>Color Name</Label>
                        <Input
                          value={colorData.colorName}
                          onChange={(e) => updateColorName(colorData.id, e.target.value)}
                          placeholder="e.g., Midnight Black"
                        />
                      </div>
                      {colors.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeColorSection(colorData.id)}
                          className="mt-6 text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div>
                      <Label>Available Sizes (optional - defaults to product sizes)</Label>
                      <Input
                        value={colorData.availableSize.join(', ')}
                        onChange={(e) => updateAvailableSizes(colorData.id, e.target.value)}
                        placeholder="S, M, L (leave empty to use product sizes)"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <label
                        className={`flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors ${colorData.isUploading ? 'opacity-50 cursor-not-allowed' : ''
                          } ${!colorData.colorName.trim() ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          disabled={colorData.isUploading || !colorData.colorName.trim()}
                          onChange={(e) => {
                            if (e.target.files) {
                              uploadImages(colorData.id, e.target.files);
                              e.target.value = '';
                            }
                          }}
                        />
                        <div className="flex flex-col items-center space-y-2">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {colorData.isUploading ? 'Uploading...' : 'Upload Images'}
                          </span>
                        </div>
                      </label>

                      {colorData.urls.length > 0 && (
                        <div className="text-green-600 flex items-center space-x-1">
                          <Check className="w-4 h-4" />
                          <span className="text-sm">{colorData.urls.length} uploaded</span>
                        </div>
                      )}
                    </div>

                    {colorData.urls.length > 0 && (
                      <div className="grid grid-cols-6 gap-2">
                        {colorData.urls.map((url, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={url}
                              alt={`${colorData.colorName} ${idx + 1}`}
                              className="w-full h-16 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(colorData.id, idx)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating Product...
                  </>
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