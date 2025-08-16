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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
          className="pl-10 pr-10 bg-white border-gray-200 focus:border-gray-400 transition-colors"
          autoComplete="off"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Searching...</p>
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-500">
              <p>Error searching products. Please try again.</p>
            </div>
          )}

          {!isLoading && !error && searchResults && searchResults.length === 0 && debouncedQuery && (
            <div className="p-4 text-center text-gray-500">
              <p>No products found for "{debouncedQuery}"</p>
            </div>
          )}

          {!isLoading && !error && searchResults && searchResults.length > 0 && (
            <>
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm text-gray-600 font-medium">
                  Found {searchResults.length} products
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((product, index) => (
                  <div
                    key={product._id}
                    className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                      selectedIndex === index ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => handleProductSelect(product)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-12 h-12 mr-3">
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
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {truncateText(product.name, 30)}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Article: {product.articleNo}
                          </p>
                          
                          {/* Category and Company Info */}
                          <div className="flex items-center gap-2 mt-1">
                            {product.categoryId && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                                {typeof product.categoryId === 'string' 
                                  ? product.categoryId 
                                  : product.categoryId.name || 'Category'
                                }
                              </span>
                            )}
                            {product.companyId && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                                {typeof product.companyId === 'string' 
                                  ? product.companyId 
                                  : product.companyId.name || 'Company'
                                }
                              </span>
                            )}
                          </div>

                          {/* Tags */}
                          {product.tags && product.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              <span className="text-xs text-gray-500">Tags:</span>
                              {product.tags.slice(0, 3).map((tag, idx) => (
                                <span
                                  key={typeof tag === 'string' ? tag : tag._id || idx}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-700 border border-purple-200"
                                >
                                  {typeof tag === 'string' ? tag : tag.name || 'Tag'}
                                </span>
                              ))}
                              {product.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{product.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Available Sizes */}
                          {product.sizes && product.sizes.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs text-gray-500">Sizes:</span>
                              <div className="flex gap-1">
                                {product.sizes.slice(0, 4).map((size, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center justify-center w-5 h-5 text-xs bg-gray-100 text-gray-600 rounded border"
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
                        <div className="flex flex-col items-end ml-3">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${
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
                              className="mt-1 h-6 px-2 text-xs"
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