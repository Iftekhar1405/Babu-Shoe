'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { BillDrawer } from '@/components/BillDrawer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ShoppingBag, Loader2, Menu, X, Filter } from 'lucide-react';
import { CustomerInfo, Product, ProductDetail } from '@/types';
import { useCategories, useProducts, useProductSearch, useCurrentBill } from '@/lib/api-advance';
import { useAuth } from '@/lib/auth-hooks';
import { Label } from '@/components/ui/label';

export default function Page() {
  return (
    <Suspense>
      <ProductsPage />
    </Suspense>
  )
}

function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');
  const [filteredProducts, setFilteredProducts] = useState<Product<true>[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || 'all');
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  const { isAuthenticated } = useAuth();

  // API hooks
  const { data: categories, isLoading: categoryLoading } = useCategories();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: searchResults, isLoading: searchLoading, error: searchError } = useProductSearch(searchQuery);

  // Current bill from API - only for authenticated users
  const { data: bill, isLoading: billLoading, refetch: refetchBill } = useCurrentBill({
    enabled: isAuthenticated,
  });

  // Get bill items and total from API
  const billItems = bill?.items || [];
  const billItemsCount = billItems.reduce((sum, item) => sum + item.quantity, 0);
  const billTotal = bill?.totalAmount || 0;

  useEffect(() => {
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, [categoryId]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearchMode(true);
      if (searchResults && !searchLoading) {
        setFilteredProducts(searchResults);
      }
    } else {
      setIsSearchMode(false);
      filterProducts();
    }
  }, [products, selectedCategory, searchQuery, searchResults, searchLoading]);

  // Refresh when bill opens
  useEffect(() => {
    if (isBillOpen && isAuthenticated) {
      refetchBill();
    }
  }, [isBillOpen, isAuthenticated, refetchBill]);

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
      setSelectedCategory('all');
    }
  };

  const handlePrintBillWithCustomer = (items: ProductDetail<true>[], customerInfo: CustomerInfo) => {
    console.log('Printing bill for:', customerInfo);
  };

  const handleAddToOrder = (items: ProductDetail<true>[], customerInfo: CustomerInfo) => {
    console.log('Adding to order:', { items, customerInfo });
  };

  const getCategoryName = (id: string) => {
    if (!categories) return 'Unknown Category';
    const category = categories.find(cat => cat?._id === id);
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
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4 mx-auto" />
          <div className="text-lg text-gray-600">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section - Back button and title */}
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1 sm:flex-none">
              <Link href="/">
                <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-black truncate">Products</h1>
            </div>

            {/* Center section - Search bar (hidden on mobile) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <SearchBar
                onSearch={handleSearchQueryChange}
                placeholder="Search products..."
              />
            </div>

            {/* Right section - Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile filter toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFilterOpen(true)}
                className="md:hidden p-2"
              >
                <Filter className="h-4 w-4" />
              </Button>

              {isAuthenticated ? (
                <Button
                  onClick={() => setIsBillOpen(true)}
                  variant="outline"
                  className="relative border-gray-300 hover:bg-gray-50 px-2 sm:px-4"
                  disabled={billLoading}
                >
                  {billLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline ml-2">Loading...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                      <span className="hidden sm:inline">Bill ({billItemsCount})</span>
                      <span className="sm:hidden">({billItemsCount})</span>
                      {billItemsCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {billItemsCount > 99 ? '99+' : billItemsCount}
                        </span>
                      )}
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <span className="hidden sm:inline text-sm text-gray-600">Sign in to use cart</span>
                  <Link href="/auth/login">
                    <Button size="sm" className="bg-black hover:bg-gray-800 text-white px-3 sm:px-4">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile search bar */}
          <div className="md:hidden pb-4">
            <SearchBar
              onSearch={handleSearchQueryChange}
              placeholder="Search products..."
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Desktop Filters */}
        {!isSearchMode && (
          <div className="hidden md:block mb-6 lg:mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by category:</span>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.length && categories.map((category) => (
                      <SelectItem key={category?._id} value={category?._id || ''}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category count info */}
              <div className="text-sm text-gray-500">
                {selectedCategory === 'all'
                  ? `Showing all ${filteredProducts.length} products`
                  : `${filteredProducts.length} products in ${getCategoryName(selectedCategory)}`
                }
              </div>
            </div>
          </div>
        )}

        {/* Search Mode Indicator */}
        {isSearchMode && searchQuery && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-blue-800 font-medium text-sm sm:text-base">🔍 Search Mode Active</span>
                <span className="text-blue-600 text-sm">Showing results for "{searchQuery}"</span>
                {searchLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearchQueryChange('')}
                className="text-blue-800 hover:bg-blue-100 self-start sm:self-auto"
              >
                Clear Search
              </Button>
            </div>
          </div>
        )}

        {/* Authentication Notice for Non-Authenticated Users */}
        {!isAuthenticated && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-start space-x-3 flex-1">
                <ShoppingBag className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-amber-800 font-medium text-sm sm:text-base">Sign in to add products to your bill</p>
                  <p className="text-amber-700 text-sm mt-1">Create an account or sign in to access billing features.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link href="/auth/login">
                  <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto">
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
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
          <div className="text-center py-8 sm:py-12">
            <Loader2 className="h-8 sm:h-12 w-8 sm:w-12 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Searching products...</p>
          </div>
        )}

        {/* Empty State */}
        {!searchLoading && filteredProducts.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4 px-4 text-sm sm:text-base">
              {isSearchMode && searchQuery
                ? `No products match your search for "${searchQuery}".`
                : selectedCategory === 'all'
                  ? "No products are available at the moment."
                  : `No products found in ${getCategoryName(selectedCategory)}.`
              }
            </p>
            {isSearchMode && (
              <Button
                variant="outline"
                onClick={() => handleSearchQueryChange('')}
                className="border-gray-300 hover:bg-gray-50"
              >
                View All Products
              </Button>
            )}
          </div>
        )}

        {/* Products Grid */}
        {!searchLoading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product?._id}
                product={product}
                showAddToBill={isAuthenticated}
              />
            ))}
          </div>
        )}

        {/* Load More Button (for future pagination) */}
        {!searchLoading && filteredProducts.length > 0 && filteredProducts.length >= 20 && (
          <div className="text-center mt-6 sm:mt-8">
            <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
              Load More Products
            </Button>
          </div>
        )}
      </main>

      {/* Bill Drawer */}
      {isAuthenticated && (
        <BillDrawer
          isOpen={isBillOpen}
          onClose={() => setIsBillOpen(false)}
        />
      )}
    </div>
  );
}