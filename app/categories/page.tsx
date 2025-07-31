'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PageHeader } from '@/components/PageHeader';
import { CategoryCard } from '@/components/CategoryCard';
import { AddCategoryForm } from '@/components/AddCategoryForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Category } from '@/types';
import { apiClient } from '@/lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryAdded = () => {
    fetchCategories();
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSearch={false} />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Categories"
          description="Manage your product categories"
          action={{
            label: 'Add Category',
            onClick: () => setIsDialogOpen(true),
          }}
        />

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No categories found.</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="text-blue-600 hover:text-blue-800">
                  Create your first category
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <AddCategoryForm onSuccess={handleCategoryAdded} />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}

        {/* Add Category Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <AddCategoryForm onSuccess={handleCategoryAdded} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}