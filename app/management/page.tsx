'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PageHeader } from '@/components/PageHeader';
import { AddCategoryForm } from '@/components/AddCategoryForm';
import { AddProductForm } from '@/components/AddProductForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Grid3X3, Plus, TrendingUp, BarChart3, ShoppingBag, Layers } from 'lucide-react';
import { Category, Product } from '@/types';
import { useCategories, useProducts } from '@/lib/api-advance';
import { useScreenSize } from '@/context/Screen-size-context';


const ManagementPage: React.FC = () => {
  const { isMobile } = useScreenSize();

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <div className="text-lg text-gray-700 font-medium">Loading management dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header showSearch={false} />

      <div className={`${isMobile ? 'px-4' : 'px-4 sm:px-6 lg:px-8'} py-6 sm:py-8`}>
        <PageHeader
          title="Management Dashboard"
          description="Add and manage your products and categories with ease"
        />

        {/* Enhanced Stats Overview */}
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-6'} mb-8`}>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Products</CardTitle>
              <div className="p-2 bg-blue-200 rounded-full">
                <Package className="h-4 w-4 text-blue-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 mb-1">{products?.length || 0}</div>
              <p className="text-xs text-blue-600">Active inventory items</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Categories</CardTitle>
              <div className="p-2 bg-green-200 rounded-full">
                <Layers className="h-4 w-4 text-green-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 mb-1">{categories?.length || 0}</div>
              <p className="text-xs text-green-600">Product categories</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Growth</CardTitle>
              <div className="p-2 bg-purple-200 rounded-full">
                <TrendingUp className="h-4 w-4 text-purple-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 mb-1">+12%</div>
              <p className="text-xs text-purple-600">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Management Forms */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-bold">Add New Items</span>
                <p className="text-gray-300 text-sm mt-1 font-normal">Expand your inventory with new products and categories</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className={`${isMobile ? 'p-0' : 'p-8'}`}>
            <Tabs defaultValue="add-product" className="w-full">
              <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'h-12' : 'h-14 max-w-md'} bg-gray-100 p-1 rounded-xl`}>
                <TabsTrigger 
                  value="add-product" 
                  className={`${isMobile ? 'text-sm px-2' : 'text-base px-6'} data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium`}
                >
                  <ShoppingBag className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                  Add Product
                </TabsTrigger>
                <TabsTrigger 
                  value="add-category" 
                  className={`${isMobile ? 'text-sm px-2' : 'text-base px-6'} data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium`}
                >
                  <Grid3X3 className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                  Add Category
                </TabsTrigger>
              </TabsList>

              <TabsContent value="add-product" className={`${isMobile ? 'mt-4' : 'mt-8'}`}>
                <div className="max-w-full">
                  <AddProductForm onSuccess={handleProductAdded} />
                </div>
              </TabsContent>

              <TabsContent value="add-category" className={`${isMobile ? 'mt-4' : 'mt-8'}`}>
                <div className="max-w-full">
                  <div className={`${isMobile ? 'max-w-full' : 'max-w-2xl'}`}>
                    <AddCategoryForm onSuccess={handleCategoryAdded} />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Stats Footer */}
        {!isMobile && (
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">Analytics</div>
                  <div className="text-xs text-gray-600">View insights</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <Package className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">Inventory</div>
                  <div className="text-xs text-gray-600">Manage stock</div>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Grid3X3 className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">Categories</div>
                  <div className="text-xs text-gray-600">Organize items</div>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-full">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">Reports</div>
                  <div className="text-xs text-gray-600">Sales data</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagementPage;