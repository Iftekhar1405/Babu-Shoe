'use client';

import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Bell, User, Search, Menu } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onSearch?: (query: string) => void;
  billItemsCount?: number;
  onOpenBill?: () => void;
  showSearch?: boolean;
  onMenuToggle?: () => void;
}

export function Header({
  onSearch,
  billItemsCount = 0,
  onOpenBill,
  showSearch = true,
  onMenuToggle
}: HeaderProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 lg:pl-64">
      <div className="px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            {onMenuToggle && (
              <Button
                onClick={onMenuToggle}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Search Bar - Hidden on mobile when collapsed */}
          <div className={`flex-1 max-w-md mx-4 ${showMobileSearch ? 'block' : 'hidden sm:block'}`}>
            {showSearch && onSearch && (
              <SearchBar onSearch={onSearch} placeholder="Search products..." />
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center">
            {/* Mobile Search Toggle */}
            {showSearch && onSearch && (
              <Button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                variant="ghost"
                size="sm"
                className="sm:hidden p-2 mr-1"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Bill Button */}
            {onOpenBill && (
              <Button
                onClick={onOpenBill}
                variant="outline"
                size="sm"
                className="relative border-gray-300 hover:bg-gray-50 mr-2 sm:mr-3"
              >
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                <span className="hidden xs:inline">Bill</span>
                <span className="ml-1">({billItemsCount})</span>
              </Button>
            )}

            {/* User Profile */}
            <Button variant="ghost" size="sm" className="p-2">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar - Full width when expanded */}
        {showMobileSearch && showSearch && onSearch && (
          <div className="pb-3 sm:hidden">
            <SearchBar onSearch={onSearch} placeholder="Search products..." />
          </div>
        )}
      </div>
    </header>
  );
}