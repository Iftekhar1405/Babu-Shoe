'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateCategory, useUploadImages, useUploadImagesLegacy } from '@/lib/api-advance';
import { Upload, Image as ImageIcon, Layers, Check, X, Loader2, RotateCcw } from 'lucide-react';
import { useScreenSize } from '@/context/Screen-size-context';


const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name too long'),
  image: z.any().refine((files) => files?.length > 0, 'Please select an image file'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface AddCategoryFormProps {
  onSuccess: () => void;
}

export function AddCategoryForm({ onSuccess }: AddCategoryFormProps) {
  const { isMobile } = useScreenSize();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { mutateAsync, isPending } = useUploadImagesLegacy();
  const { mutate } = useCreateCategory()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setValue('image', e.target.files);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    if (!selectedImage) return;

    setIsSubmitting(true);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('images', selectedImage);
      formData.append('color', 'category');

      const uploadResponse = await mutateAsync(formData);

      const categoryData = {
        name: data?.name,
        image: uploadResponse?.urls?.[0],
      };

      mutate(categoryData);

      reset();
      setSelectedImage(null);
      setImagePreview(null);
      onSuccess();
    } catch (error) {
      console.error('Failed to create category:', error);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    reset();
    setSelectedImage(null);
    setImagePreview(null);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setValue('image', null);
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-t-lg">
        <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Layers className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </div>
            <div>
              <span>Create New Category</span>
              <p className={`text-emerald-100 ${isMobile ? 'text-xs' : 'text-sm'} mt-1 font-normal`}>
                Organize your products with custom categories
              </p>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className={`${isMobile ? 'p-4' : 'p-8'}`}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Name */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
            <Label htmlFor="name" className="text-gray-700 font-semibold text-base flex items-center">
              <Layers className="h-4 w-4 mr-2 text-emerald-600" />
              Category Name
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter category name (e.g., Electronics, Clothing)"
              className="mt-3 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 h-12 text-base"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <X className="h-4 w-4 mr-1" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <Label htmlFor="image" className="text-gray-700 font-semibold text-base flex items-center mb-4">
              <ImageIcon className="h-4 w-4 mr-2 text-blue-600" />
              Category Image
            </Label>
            
            {!imagePreview ? (
              <label
                htmlFor="image"
                className={`block w-full border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isUploading}
                />
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <Upload className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-gray-900">
                      {isUploading ? 'Processing...' : 'Upload Category Image'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Click to select or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                  {isUploading && (
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  )}
                </div>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Category preview"
                    className={`${isMobile ? 'w-full h-48' : 'w-64 h-48'} object-cover rounded-xl border-2 border-blue-300 shadow-lg`}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-sm font-medium">Image selected successfully</span>
                </div>
              </div>
            )}
            
            {errors.image && !imagePreview && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <X className="h-4 w-4 mr-1" />
                Please select an image file
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3 pt-2`}>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedImage}
              className={`${isMobile ? 'w-full h-12' : 'flex-1 h-12'} bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating Category...
                </>
              ) : (
                <>
                  <Layers className="w-5 h-5 mr-2" />
                  Create Category
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
              className={`${isMobile ? 'w-full h-12' : 'px-6 h-12'} border-gray-300 hover:bg-gray-50 text-gray-700 font-medium`}
            >
              <RotateCcw className="w-4 w-4 mr-2" />
              Reset Form
            </Button>
          </div>

          {/* Help Text */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">📝 Tips for better categories:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Use clear, descriptive names</li>
              <li>• Choose high-quality, relevant images</li>
              <li>• Keep category names concise but informative</li>
              <li>• Consider how customers will search for products</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}