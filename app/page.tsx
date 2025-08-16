'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { PageHeader } from '@/components/PageHeader';
import { CategoryCard } from '@/components/CategoryCard';
import { ProductCard } from '@/components/ProductCard';
import { BillDrawer } from '@/components/BillDrawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Grid3X3, ShoppingBag, TrendingUp } from 'lucide-react';
import { useCategories, useProducts, useCurrentBill } from '@/lib/api-advance';
import { useAuth } from '@/lib/auth-hooks';
import { CustomerInfo } from '@/types';

function DashboardContent() {
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { isAuthenticated } = useAuth();

  const { data: categories, isLoading: categoryLoading } = useCategories();
  const { data: products, isLoading: productsLoading } = useProducts({ search: searchQuery });

  const { data: bill } = useCurrentBill({
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
  };

  const handlePrintBillWithCustomer = (items: any[], customerInfo: CustomerInfo) => {
    // TODO: We are using function directly inside the component so we need
    // thisfucntion. And in fututre it will be removed. InshaAllah
    // handlePrintBill(items, customerInfo);
    console.log('Printing bill for:', customerInfo);
  };

  const handleAddToOrder = (items: any[], customerInfo: CustomerInfo) => {
    // Your add to order logic here
    console.log('Adding to order:', { items, customerInfo });
    // You can implement the order creation API call here
  };

  if (categoryLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        onSearch={handleSearch}
        onOpenBill={() => setIsBillOpen(true)}
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Dashboard"
          description="Overview of your e-commerce store"
        />

        {/* Stats Cards - Only show for authenticated users */}
        {isAuthenticated && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Available products
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <Grid3X3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Items in Bill</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {bill?.items?.reduce((total, item) => total + item.quantity, 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current bill items
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bill Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{bill?.totalAmount?.toFixed(2) || '0.00'}</div>
                <p className="text-xs text-muted-foreground">
                  Current bill amount
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {searchQuery ? (
          /* Search Results */
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Search Results for "{searchQuery}"
              </h2>
              <p className="text-sm text-gray-500">
                {products?.length || 0} products found
              </p>
            </div>

            {searchQuery && products?.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-4">
                    No products match your search for "{searchQuery}". Try adjusting your search terms.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products?.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    showAddToBill={isAuthenticated}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Dashboard Content */
          <div className="space-y-8">
            {/* Categories Section - Always visible */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
                {categories && categories.length > 4 && (
                  <p className="text-sm text-gray-500">
                    Showing 4 of {categories.length} categories
                  </p>
                )}
              </div>

              {categories?.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <Grid3X3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                  <p className="text-gray-500">Create your first category to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {categories?.slice(0, 4).map((category) => (
                    <CategoryCard key={category._id} category={category} />
                  ))}
                </div>
              )}
            </section>

            {/* Products Section - Always visible */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Products</h2>
                {products && products.length > 8 && (
                  <p className="text-sm text-gray-500">
                    Showing 8 of {products.length} products
                  </p>
                )}
              </div>

              {products?.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500">Add your first product to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products?.slice(0, 8).map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      showAddToBill={isAuthenticated}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Welcome message for non-authenticated users */}
        {!isAuthenticated && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-900">
                  Sign in to access billing features
                </h3>
                <p className="mt-1 text-blue-700">
                  Create an account or sign in to add products to your bill, manage orders, and access advanced features.
                </p>
                <div className="mt-4 flex space-x-3">
                  <a
                    href="/auth/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </a>
                  <a
                    href="/auth/register"
                    className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                  >
                    Create Account
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bill Drawer - Only for authenticated users */}
      {isAuthenticated && (
        <BillDrawer
          isOpen={isBillOpen}
          onClose={() => setIsBillOpen(false)}
        // onPrintBill={handlePrintBillWithCustomer}
        // onAddToOrder={handleAddToOrder}
        />
      )}
    </>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}