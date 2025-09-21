'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, ShoppingBag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { useProductSearch } from '@/lib/api-advance';
import { Product } from '@/types';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onAddToBill?: (product: Product) => void;
  placeholder?: string;
  className?: string;
}

interface SearchResult {
  success: boolean;
  data: Product[];
  count: number;
}

export function SearchBar({ 
  onSearch, 
  onAddToBill,
  placeholder = "Search products...", 
  className = "" 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use the search hook with proper typing
  const { 
    data: searchResults, 
    isLoading, 
    error 
  } = useProductSearch(debouncedQuery);

  useEffect(() => {
    if (debouncedQuery) {
      onSearch(debouncedQuery);
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setIsOpen(false);
    }
  }, [debouncedQuery, onSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!searchResults?.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          handleProductSelect(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [searchResults, selectedIndex]);

  const handleClear = useCallback(() => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    onSearch('');
    inputRef.current?.focus();
  }, [onSearch]);

  const handleProductSelect = useCallback((product: Product) => {
    setQuery(product.name);
    setIsOpen(false);
    setSelectedIndex(-1);
    // Optionally add to bill or perform other actions
    if (onAddToBill) {
      onAddToBill(product);
    }
  }, [onAddToBill]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div ref={searchRef} className={`relative flex items-center ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (debouncedQuery && searchResults?.length) {
              setIsOpen(true);
            }
          }}
          className="pl-10 pr-10 bg-white border-gray-200 focus:border-gray-400 transition-colors text-sm sm:text-base"
          autoComplete="off"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 z-10"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 sm:max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="p-3 sm:p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-xs sm:text-sm">Searching...</p>
            </div>
          )}

          {error && (
            <div className="p-3 sm:p-4 text-center text-red-500">
              <p className="text-xs sm:text-sm">Error searching products. Please try again.</p>
            </div>
          )}

          {!isLoading && !error && searchResults && searchResults.length === 0 && debouncedQuery && (
            <div className="p-3 sm:p-4 text-center text-gray-500">
              <p className="text-xs sm:text-sm">No products found for "{truncateText(debouncedQuery, 20)}"</p>
            </div>
          )}

          {!isLoading && !error && searchResults && searchResults.length > 0 && (
            <>
              <div className="p-2 sm:p-3 border-b border-gray-100 bg-gray-50">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Found {searchResults.length} products
                </p>
              </div>
              <div className="max-h-60 sm:max-h-80 overflow-y-auto">
                {searchResults.map((product, index) => (
                  <div
                    key={product._id}
                    className={`flex items-center p-2 sm:p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                      selectedIndex === index ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => handleProductSelect(product)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 mr-2 sm:mr-3">
                      <img
                        src={product.image || '/placeholder-image.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-md border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 min-w-0 mb-1 sm:mb-0">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {truncateText(product.name, window.innerWidth < 640 ? 20 : 30)}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Art: {product.articleNo}
                          </p>
                          
                          {/* Category and Company Info */}
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            {product.categoryId && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                                {typeof product.categoryId === 'string' 
                                  ? truncateText(product.categoryId, 10)
                                  : truncateText(product.categoryId.name || 'Category', 10)
                                }
                              </span>
                            )}
                            {product.companyId && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800">
                                {typeof product.companyId === 'string' 
                                  ? truncateText(product.companyId, 10)
                                  : truncateText(product.companyId.name || 'Company', 10)
                                }
                              </span>
                            )}
                          </div>

                          {/* Tags - Only show on larger screens */}
                          {product.tags && product.tags.length > 0 && (
                            <div className="hidden sm:flex items-center gap-1 mt-1 flex-wrap">
                              <span className="text-xs text-gray-500">Tags:</span>
                              {product.tags.slice(0, 2).map((tag, idx) => (
                                <span
                                  key={typeof tag === 'string' ? tag : tag._id || idx}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-700 border border-purple-200"
                                >
                                  {typeof tag === 'string' 
                                    ? truncateText(tag, 8) 
                                    : truncateText(tag.name || 'Tag', 8)
                                  }
                                </span>
                              ))}
                              {product.tags.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{product.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Available Sizes */}
                          {product.sizes && product.sizes.length > 0 && (
                            <div className="hidden sm:flex items-center gap-1 mt-1">
                              <span className="text-xs text-gray-500">Sizes:</span>
                              <div className="flex gap-1">
                                {product.sizes.slice(0, 4).map((size, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center justify-center w-4 h-4 text-xs bg-gray-100 text-gray-600 rounded border"
                                  >
                                    {size}
                                  </span>
                                ))}
                                {product.sizes.length > 4 && (
                                  <span className="text-xs text-gray-500">
                                    +{product.sizes.length - 4}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Price and Actions */}
                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start ml-0 sm:ml-3 mt-1 sm:mt-0">
                          <span className="text-sm font-semibold text-gray-900 order-2 sm:order-1">
                            {formatPrice(product.price)}
                          </span>
                          <div className="flex items-center gap-1 order-1 sm:order-2 sm:mt-1">
                            <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded ${
                              product.inStock 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                          
                          {onAddToBill && product.inStock && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="hidden sm:inline-flex mt-1 h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToBill(product);
                              }}
                            >
                              <ShoppingBag className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}