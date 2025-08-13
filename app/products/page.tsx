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
import { Category, Product, ProductDetail } from '@/types';
import { handlePrintBill } from '@/components/handlePrintBill';
import { useCategories, useProducts, useProductSearch } from '@/lib/api-advance';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');
  const [filteredProducts, setFilteredProducts] = useState<Product<true>[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || 'all');
  const [billItems, setBillItems] = useState<ProductDetail[]>([]);
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  const { data: categories, isLoading: categoryLoading, refetch: categoryRefetch } = useCategories();
  const { data: products, isLoading: productsLoading, refetch: productsRefetch } = useProducts();
  
  // Search results from API
  const { 
    data: searchResults, 
    isLoading: searchLoading, 
    error: searchError 
  } = useProductSearch(searchQuery);

  useEffect(() => {
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, [categoryId]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearchMode(true);
      // When searching, use search results from API
      if (searchResults && !searchLoading) {
        setFilteredProducts(searchResults);
      }
    } else {
      setIsSearchMode(false);
      // When not searching, use regular filtering
      filterProducts();
    }
  }, [products, selectedCategory, searchQuery, searchResults, searchLoading]);

  const filterProducts = () => {
    if (!products) return;

    let filtered: Product<true>[] = products;

    // Filter by category only when not in search mode
    if (!isSearchMode && selectedCategory !== 'all') {
      filtered = filtered?.filter(product => product?.categoryId?._id === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setIsSearchMode(false);
      setSelectedCategory('all'); // Reset category when clearing search
    }
  };

  const handleAddToBill = (product: Product<true>) => {
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

  const getCategoryName = (id: string) => {
    if (!categories) return 'Unknown Category';

    const category = categories.find(cat => cat._id === id);
    return category ? category.name : 'Unknown Category';
  };

  const getResultsTitle = () => {
    if (isSearchMode && searchQuery) {
      if (searchLoading) {
        return `Searching for "${searchQuery}"...`;
      }
      if (searchError) {
        return `Search error for "${searchQuery}"`;
      }
      return `Search Results for "${searchQuery}" (${filteredProducts.length})`;
    }
    
    if (selectedCategory === 'all') {
      return `All Products (${filteredProducts.length})`;
    }
    
    return `${getCategoryName(selectedCategory)} (${filteredProducts.length})`;
  };

  if (categoryLoading || productsLoading) {
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
              <SearchBar 
                onSearch={handleSearchQueryChange} 
                onAddToBill={handleAddToBill}
                placeholder="Search products..." 
              />
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
        {/* Filters - Hide category filter when searching */}
        {!isSearchMode && (
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
                    {categories?.length && categories.map((category) => (
                      <SelectItem key={category._id} value={category._id || ''}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Search Mode Indicator */}
        {isSearchMode && searchQuery && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-blue-800 font-medium">🔍 Search Mode Active</span>
                <span className="text-blue-600">Showing search results for "{searchQuery}"</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearchQueryChange('')}
                className="text-blue-800 hover:bg-blue-100"
              >
                Clear Search
              </Button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {getResultsTitle()}
          </h2>
          {searchError && (
            <p className="text-red-500 text-sm mt-2">
              Error loading search results. Please try again.
            </p>
          )}
        </div>

        {/* Loading State */}
        {searchLoading && isSearchMode && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-500 mt-4">Searching products...</p>
          </div>
        )}

        {/* Products Grid */}
        {!searchLoading && filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {isSearchMode && searchQuery
                ? `No products found matching "${searchQuery}".`
                : selectedCategory === 'all'
                  ? "No products available."
                  : `No products found in ${getCategoryName(selectedCategory)}.`
              }
            </p>
            {isSearchMode && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => handleSearchQueryChange('')}
              >
                View All Products
              </Button>
            )}
          </div>
        ) : (
          !searchLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToBill={handleAddToBill}
                />
              ))}
            </div>
          )
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