'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PageHeader } from '@/components/PageHeader';
import { AddCategoryForm } from '@/components/AddCategoryForm';
import { AddProductForm } from '@/components/AddProductForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Grid3X3, Plus, TrendingUp } from 'lucide-react';
import { Category, Product } from '@/types';
import { useCategories, useProducts } from '@/lib/api-advance';

const ManagementPage: React.FC = () => {

  const { data: categories, isLoading: categoryLoading, refetch: categoryRefetch } = useCategories()
  const { data: products, isLoading: productsLoading, refetch: productsRefetch } = useProducts()

  const handleCategoryAdded = () => {
    categoryRefetch();
  };

  const handleProductAdded = () => {
    productsRefetch();
  };

  if (categoryLoading || productsLoading) {
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
          title="Management"
          description="Add and manage your products and categories"
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products?.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Grid3X3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories?.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12%</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Forms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Add New Items</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="add-product" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="add-product">Add Product</TabsTrigger>
                <TabsTrigger value="add-category">Add Category</TabsTrigger>
              </TabsList>

              <TabsContent value="add-product" className="mt-6">
                <div className="max-w-2xl">
                  <AddProductForm onSuccess={handleProductAdded} />
                </div>
              </TabsContent>

              <TabsContent value="add-category" className="mt-6">
                <div className="max-w-2xl">
                  <AddCategoryForm onSuccess={handleCategoryAdded} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagementPage;