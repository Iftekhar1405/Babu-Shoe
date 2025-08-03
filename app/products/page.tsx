'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { BillDrawer } from '@/components/BillDrawer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Category, Product, BillItem } from '@/types';
import { apiClient } from '@/lib/api';
import { handlePrintBill } from '@/components/handlePrintBill';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product<true>[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product<true>[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || 'all');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, [categoryId]);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery]);

  const fetchInitialData = async () => {
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

  const filterProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoryId._id === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.articleNo.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAddToBill = (product: Product<true>) => {
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

  const getCategoryName = (id: string) => {
    const category = categories.find(cat => cat.id === id);
    return category ? category.name : 'Unknown Category';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-black">Products</h1>
            </div>

            <div className="flex-1 max-w-md mx-8">
              <SearchBar onSearch={setSearchQuery} placeholder="Search products..." />
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setIsBillOpen(true)}
                variant="outline"
                className="relative border-gray-300 hover:bg-gray-50"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Bill ({billItems.length})
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Filter by category:</span>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedCategory === 'all'
              ? `All Products (${filteredProducts.length})`
              : `${getCategoryName(selectedCategory)} (${filteredProducts.length})`
            }
            {searchQuery && (
              <span className="text-gray-500 font-normal"> - Search: "{searchQuery}"</span>
            )}
          </h2>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery
                ? "No products found matching your search criteria."
                : selectedCategory === 'all'
                  ? "No products available."
                  : `No products found in ${getCategoryName(selectedCategory)}.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToBill={handleAddToBill}
              />
            ))}
          </div>
        )}
      </main>

      {/* Bill Drawer */}
      <BillDrawer
        isOpen={isBillOpen}
        onClose={() => setIsBillOpen(false)}
        items={billItems}
        onUpdateItem={handleUpdateBillItem}
        onRemoveItem={handleRemoveBillItem}
        onClearBill={handleClearBill}
        onPrintBill={() => handlePrintBill(billItems)}
      />
    </div>
  );
}