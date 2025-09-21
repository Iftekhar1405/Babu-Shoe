
'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import CreatableSelect from 'react-select/creatable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Upload, Loader2, Check, Image as ImageIcon, Palette, Package, Tag, IndianRupee } from 'lucide-react';
import { useCategories, useCreateProduct, useCreateTag, useTags, useUploadImagesLegacy } from '@/lib/api-advance';
import { Product, ColorData } from '@/types';
import { toast } from 'sonner';
import { useCompanies } from '@/lib/company.service';
import { useScreenSize } from '@/context/Screen-size-context';


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
 const { isMobile } = useScreenSize();
  const [colors, setColors] = useState<ColorFormData[]>([
    { id: '1', colorName: '', urls: [], isUploading: false, availableSize: [] }
  ]);
  const [selectedTags, setSelectedTags] = useState<{ label: string; value: string }[]>([]);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [isUploadingMainImage, setIsUploadingMainImage] = useState<boolean>(false);

  const { data: categories } = useCategories();
  const { data: tags, isLoading: tagsLoading } = useTags()
  const { data: companies } = useCompanies()

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

  const { mutateAsync } = useUploadImagesLegacy();
  const { mutateAsync: createTags } = useCreateTag()

  const tagsOptions = useMemo(() => {
    if (!tagsLoading && tags && tags.length) {
      return tags.map(t => ({ label: t.name, value: t._id }))
    }
  }, [tags, tagsLoading])

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
      formData.append('images', files[0]); 
      formData.append('color', 'main'); 

      const result = await mutateAsync(formData);
      const uploadedUrls = Array.isArray(result) ? result :
        result.urls ? result.urls : [];

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

      const result = await mutateAsync(formData);
      const uploadedUrls = Array.isArray(result) ? result :
        result.urls ? result.urls : [];

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

  const handleCreateTag = async (name: string) => {
    const createdTag = await createTags({ name })

    if (createdTag && createdTag._id && createdTag.name) {
      setSelectedTags(prev => [...prev, { label: createdTag.name, value: createdTag._id || '' }])
      setValue('tags', [...selectedTags.map(s => s.value), createdTag._id]);
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    const validColors = colors.filter(color => color.colorName.trim() && color.urls.length > 0);

    if (validColors.length === 0) {
      toast('Error', { description: 'Please add at least one color with images' });
      return;
    }

    const transformedColors: ColorData[] = validColors.map(color => ({
      color: color.colorName.trim(),
      urls: color.urls,
      availableSize: color.availableSize.length > 0 ? color.availableSize : data.sizes,
    }));

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
      tags: data.tags || [],
      colors: transformedColors,
    };

    try {
      mutate(productData);
    } catch (error) {
      console.error('Mutation error:', error);
      toast('Error', { description: 'Failed to create product' });
    }
  };

 return (
    <div className="max-w-full mx-auto">
      <Card className="border-0 shadow-2xl bg-white">
        <CardHeader className="pb-6 bg-black text-white rounded-t-lg">
          <CardTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white`}>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Package className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
              </div>
              <div>
                <span>Create New Product</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className={`${isMobile ? 'p-4' : 'p-8'}`}>
          <form onSubmit={handleSubmit(onSubmit)} className={`space-y-${isMobile ? '6' : '8'}`}>
            {/* Basic Product Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Basic Information
              </h3>
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
                <div>
                  <Label className="text-gray-700 font-medium">Product Name</Label>
                  <Input 
                    {...register('name')} 
                    placeholder="Enter product name" 
                    className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Article Number</Label>
                  <Input 
                    {...register('articleNo')} 
                    placeholder="Enter article number" 
                    className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.articleNo && <p className="text-red-500 text-xs mt-1">{errors.articleNo.message}</p>}
                </div>

                <div className={`${isMobile ? 'col-span-1' : 'md:col-span-2'}`}>
                  <Label className="text-gray-700 font-medium">Main Product Image</Label>
                  <div className="mt-2">
                    <label
                      className={`block w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 ${
                        isUploadingMainImage ? 'opacity-50 cursor-not-allowed' : ''
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
                      <div className="flex flex-col items-center space-y-3">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <ImageIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {isUploadingMainImage ? 'Uploading...' : 'Upload Main Product Image'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                        </div>
                      </div>
                    </label>

                    {mainImageUrl && (
                      <div className="flex items-center space-x-4 mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <img
                          src={mainImageUrl}
                          alt="Main product"
                          className="w-16 h-16 object-cover rounded-lg border-2 border-green-300"
                        />
                        <div className="flex-1">
                          <div className="text-green-700 flex items-center space-x-2">
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-medium">Main image uploaded successfully</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setMainImageUrl('');
                            setValue('image', '');
                          }}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
                </div>

                <div className={`${isMobile ? 'col-span-1' : 'md:col-span-2'}`}>
                  <Label className="text-gray-700 font-medium">Description</Label>
                  <textarea
                    {...register('description')}
                    placeholder="Enter product description (minimum 10 characters)"
                    className="w-full mt-2 p-4 border border-gray-300 rounded-lg resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
              <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center">
                <IndianRupee className="h-5 w-5 mr-2" />
                Product Details
              </h3>
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
                <div>
                  <Label className="text-gray-700 font-medium">Price (₹)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...register('price', { valueAsNumber: true })} 
                    placeholder="0.00" 
                    className="mt-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Category</Label>
                  <Select onValueChange={(value) => setValue('categoryId', value)}>
                    <SelectTrigger className="mt-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
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
                  {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Company</Label>
                  <Select onValueChange={(value) => setValue('companyId', value)}>
                    <SelectTrigger className="mt-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies?.map((c) => (
                        <SelectItem
                          key={c._id}
                          value={c._id || ""}
                          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={c.logo}
                              alt={c.name}
                              className="w-6 h-6 rounded-full object-cover border border-gray-300"
                            />
                            <span className="truncate">{c.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.companyId && <p className="text-red-500 text-xs mt-1">{errors.companyId.message}</p>}
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Sizes (comma separated)</Label>
                  <Input
                    placeholder="S, M, L, XL"
                    className="mt-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    onChange={(e) => {
                      const sizes = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                      setValue('sizes', sizes);
                    }}
                  />
                  {errors.sizes && <p className="text-red-500 text-xs mt-1">{errors.sizes.message}</p>}
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">In Stock</Label>
                  <Select onValueChange={(value) => setValue('inStock', value === 'true')}>
                    <SelectTrigger className="mt-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="Select stock status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">✅ Yes</SelectItem>
                      <SelectItem value="false">❌ No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className={`${isMobile ? 'col-span-1' : 'md:col-span-2'}`}>
                  <Label className="text-gray-700 font-medium">Tags</Label>
                  <div className="mt-2">
                    <CreatableSelect
                      isMulti
                      value={selectedTags}
                      onChange={(newValue: any) => {
                        const tags = newValue || [];
                        setSelectedTags(tags);
                        setValue('tags', tags.map((v: any) => v.value));
                      }}
                      options={tagsOptions}
                      onCreateOption={(inputValue: string) => handleCreateTag(inputValue)}
                      placeholder="Add tags..."
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          borderColor: '#d1d5db',
                          '&:hover': {
                            borderColor: '#10b981'
                          },
                          '&:focus-within': {
                            borderColor: '#10b981',
                            boxShadow: '0 0 0 1px #10b981'
                          }
                        })
                      }}
                    />
                  </div>
                  {errors.tags && <p className="text-red-500 text-xs mt-1">{errors.tags.message}</p>}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <div className="px-4 text-sm font-medium text-gray-500">Product Images</div>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Product Images Section */}
            <div className=" rounded-xl p-6 border ">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center">
                    Color Variants & Images
                  </h3>
                  {!isMobile && (
                           <p className={` ${isMobile ? 'text-xs' : 'text-sm'} mt-1`}>
                    Add images for each color variant of your product
                  </p>
                  )}
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size={isMobile ? "sm" : "default"}
                  onClick={addColorSection}
                  className="flex justify-center items-center"
                >
                  <Plus className="h-4 w-4" />
                 {!isMobile &&   <span className='ml-2'>Add Color</span> }
                </Button>
              </div>

              <div className="space-y-6">
                {colors.map((colorData, index) => (
                  <Card key={colorData.id} className=" bg-white/80 backdrop-blur-sm">
                    <CardHeader className="">
                      <div className="flex items-center justify-between">
                        <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold flex items-center`}>
                              <Palette className="h-5 w-5 mr-2" />
                          Color Variant #{index + 1}
                        </CardTitle>
                        {colors.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeColorSection(colorData.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className={`${isMobile ? 'p-4' : 'p-6'} space-y-4`}>
                      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                        <div>
                          <Label className="text-gray-700 font-medium">Color Name</Label>
                          <Input
                            value={colorData.colorName}
                            onChange={(e) => updateColorName(colorData.id, e.target.value)}
                            placeholder="e.g., Midnight Black, Ocean Blue"
                            className="mt-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <Label className="text-gray-700 font-medium">Available Sizes (optional)</Label>
                          <Input
                            value={colorData.availableSize.join(', ')}
                            onChange={(e) => updateAvailableSizes(colorData.id, e.target.value)}
                            placeholder="S, M, L (leave empty to use product sizes)"
                            className="mt-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">Leave empty to use general product sizes</p>
                        </div>
                      </div>

                      {/* Image Upload Section */}
                      <div className="space-y-4">
                        <label
                          className={`flex-1 border-2 border-dashed border-purple-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 ${
                            colorData.isUploading ? 'opacity-50 cursor-not-allowed' : ''
                          } ${
                            !colorData.colorName.trim() ? 'opacity-50 cursor-not-allowed' : ''
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
                          <div className="flex flex-col items-center space-y-3">
                            <div className="p-3 bg-purple-100 rounded-full">
                              <Upload className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {colorData.isUploading ? 'Uploading Images...' : 'Upload Color Images'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {!colorData.colorName.trim() ? 'Enter color name first' : 'Select multiple images for this color'}
                              </p>
                            </div>
                            {colorData.isUploading && (
                              <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                            )}
                          </div>
                        </label>

                        {colorData.urls.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-green-600 flex items-center space-x-2">
                                <Check className="w-4 h-4" />
                                <span className="text-sm font-medium">{colorData.urls.length} images uploaded</span>
                              </div>
                            </div>
                            <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-6'} gap-3`}>
                              {colorData.urls.map((url, idx) => (
                                <div key={idx} className="relative group">
                                  <img
                                    src={url}
                                    alt={`${colorData.colorName} ${idx + 1}`}
                                    className="w-full h-20 object-cover rounded-lg border-2 border-purple-200 shadow-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(colorData.id, idx)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
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
                className={`w-full ${isMobile ? 'h-12' : 'h-14'} bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Creating Product...
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5 mr-2" />
                    Create Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}