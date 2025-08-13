'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { PageHeader } from '@/components/PageHeader';
import { CategoryCard } from '@/components/CategoryCard';
import { ProductCard } from '@/components/ProductCard';
import { BillDrawer } from '@/components/BillDrawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Grid3X3, ShoppingBag, TrendingUp } from 'lucide-react';
import { Product, ProductDetail } from '@/types';
import { handlePrintBill } from '@/components/handlePrintBill';
import { useCategories, useProducts } from '@/lib/api-advance';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/lib/auth-hooks';

function DashboardContent() {
  const [billItems, setBillItems] = useState<ProductDetail[]>([]);
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { isAuthenticated } = useAuth();
  
  const { data: categories, isLoading: categoryLoading } = useCategories();
  const { data: products, isLoading: productsLoading } = useProducts({ search: searchQuery });

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
  };

  const handleAddToBill = (product: Product) => {
    // Only authenticated users can add to bill
    if (!isAuthenticated) return;
    
    setBillItems(prev => {
      const existingItem = prev.find(item => item.productId._id === product._id);
      if (existingItem) {
        return prev.map(item =>
          item.productId._id === product._id
            ? {
              ...item,
              quantity: item.quantity + 1,
              finalPrice: product.price * (item.quantity + 1) * (1 - item.discountPercent / 100)
            }
            : item
        );
      } else {
        return [...prev, {
          productId: product,
          quantity: 1,
          discountPercent: 0,
          finalPrice: product.price
        }];
      }
    });
  };

  const handleUpdateBillItem = (productId: string, updates: Partial<ProductDetail>) => {
    setBillItems(prev =>
      prev.map(item =>
        item.productId._id === productId ? { ...item, ...updates } : item
      )
    );
  };

  const handleRemoveBillItem = (productId: string) => {
    setBillItems(prev => prev.filter(item => item.productId._id !== productId));
  };

  const handleClearBill = () => {
    setBillItems([]);
  };

  if (categoryLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <Header
        onSearch={handleSearch}
        billItemsCount={billItems.length}
        onOpenBill={() => setIsBillOpen(true)}
        showBilling={isAuthenticated} // Only show billing features for authenticated users
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
                  +2 from last month
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
                <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +3 from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹2,350</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
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
            </div>

            {searchQuery && products?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found for your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products?.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToBill={handleAddToBill}
                    showAddToBill={isAuthenticated} // Only show add to bill for authenticated users
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Categories</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories?.slice(0, 4).map((category) => (
                  <CategoryCard key={category._id} category={category} />
                ))}
              </div>
            </section>

            {/* Products Section - Always visible */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products?.slice(0, 8).map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToBill={handleAddToBill}
                    showAddToBill={isAuthenticated} // Only show add to bill for authenticated users
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Bill Drawer - Only for authenticated users */}
      {isAuthenticated && (
        <BillDrawer
          isOpen={isBillOpen}
          onClose={() => setIsBillOpen(false)}
          items={billItems}
          onUpdateItem={handleUpdateBillItem}
          onRemoveItem={handleRemoveBillItem}
          onClearBill={handleClearBill}
          onPrintBill={() => handlePrintBill(billItems)}
        />
      )}
    </>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}