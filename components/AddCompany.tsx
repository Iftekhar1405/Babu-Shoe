'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUploadImagesLegacy } from '@/lib/api-advance';
import { useCreateCompany } from '@/lib/company.service';

const CompanySchema = z.object({
    name: z.string().min(1, 'Company name is required').max(100, 'Name too long'),
    logo: z.any().refine((files) => files?.length > 0, 'Please select an image file'),
});

type CompanyFormData = z.infer<typeof CompanySchema>;

interface AddCompanyFormProps {
    onSuccess: () => void;
}

export function AddCompanyForm({ onSuccess }: AddCompanyFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { mutateAsync, isPending } = useUploadImagesLegacy();
    const { mutate } = useCreateCompany()


    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<CompanyFormData>({
        resolver: zodResolver(CompanySchema),
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            setValue('logo', e.target.files);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: CompanyFormData) => {
        if (!selectedImage) return;

        setIsSubmitting(true);
        try {

            const formData = new FormData();
            formData.append('images', selectedImage);
            formData.append('color', 'Company');

            const uploadResponse = await mutateAsync(formData);

            console.log(uploadResponse)

            const CompanyData = {
                name: data?.name,
                logo: uploadResponse?.urls?.[0],
            };

            mutate(CompanyData);


            reset();
            setSelectedImage(null);
            setImagePreview(null);
            onSuccess();
        } catch (error) {
            console.error('Failed to create Company:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        reset();
        setSelectedImage(null);
        setImagePreview(null);
    };

    return (
        <Card className="border-gray-200">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Add New Company</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Company Name</Label>
                        <Input
                            id="name"
                            {...register('name')}
                            placeholder="Enter Company name"
                            className="mt-1"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                    </div>
                    {/* Image functionality */}
                    <div>
                        <Label htmlFor="image">Company Image</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="mt-1"
                        />
                        {errors.logo && (
                            <p className="text-red-500 text-sm mt-1">Please select an image file</p>
                        )}

                        {imagePreview && (
                            <div className="mt-2">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-md border border-gray-200"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !selectedImage}
                            className="flex-1 bg-black hover:bg-gray-800 text-white"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Company'}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetForm}
                            disabled={isSubmitting}
                        >
                            Reset
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}