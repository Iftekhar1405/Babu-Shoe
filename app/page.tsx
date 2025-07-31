'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PageHeader } from '@/components/PageHeader';
import { CategoryCard } from '@/components/CategoryCard';
import { ProductCard } from '@/components/ProductCard';
import { BillDrawer } from '@/components/BillDrawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Grid3X3, ShoppingBag, TrendingUp } from 'lucide-react';
import { Category, Product, BillItem } from '@/types';
import { apiClient } from '@/lib/api';

export default function Dashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesData, productsData] = await Promise.all([
        apiClient.getCategories(),
        apiClient.getProducts()
      ]);
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await apiClient.searchProducts(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAddToBill = (product: Product) => {
    setBillItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                finalPrice: product.price * (item.quantity + 1) * (1 - item.discount / 100)
              }
            : item
        );
      } else {
        return [...prev, {
          product,
          quantity: 1,
          discount: 0,
          finalPrice: product.price
        }];
      }
    });
  };

  const handleUpdateBillItem = (productId: string, updates: Partial<BillItem>) => {
    setBillItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, ...updates } : item
      )
    );
  };

  const handleRemoveBillItem = (productId: string) => {
    setBillItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearBill = () => {
    setBillItems([]);
  };

  const handlePrintBill = () => {
    const billContent = `
      BILL SUMMARY
      ============
      
      ${billItems.map(item => `
      ${item.product.name}
      Qty: ${item.quantity} x $${item.product.price.toFixed(2)}
      Discount: ${item.discount}%
      Final: $${item.finalPrice.toFixed(2)}
      `).join('\n')}
      
      TOTAL: $${billItems.reduce((sum, item) => sum + item.finalPrice, 0).toFixed(2)}
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<pre>${billContent}</pre>`);
      printWindow.print();
      printWindow.close();
    }
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
      <Header
        onSearch={handleSearch}
        billItemsCount={billItems.length}
        onOpenBill={() => setIsBillOpen(true)}
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Dashboard"
          description="Overview of your e-commerce store"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
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
              <div className="text-2xl font-bold">{categories.length}</div>
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
              <div className="text-2xl font-bold">$2,350</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {searchQuery ? (
          /* Search Results */
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Search Results for "{searchQuery}"
              </h2>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found for your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {searchResults.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToBill={handleAddToBill}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Dashboard Content */
          <div className="space-y-8">
            {/* Recent Categories */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Categories</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.slice(0, 4).map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </section>

            {/* Recent Products */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.slice(0, 8).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToBill={handleAddToBill}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Bill Drawer */}
      <BillDrawer
        isOpen={isBillOpen}
        onClose={() => setIsBillOpen(false)}
        items={billItems}
        onUpdateItem={handleUpdateBillItem}
        onRemoveItem={handleRemoveBillItem}
        onClearBill={handleClearBill}
        onPrintBill={handlePrintBill}
      />
    </div>
  );
}