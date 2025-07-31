'use client';

import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Bell, User } from 'lucide-react';

interface HeaderProps {
  onSearch?: (query: string) => void;
  billItemsCount?: number;
  onOpenBill?: () => void;
  showSearch?: boolean;
}

export function Header({ 
  onSearch, 
  billItemsCount = 0, 
  onOpenBill, 
  showSearch = true 
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 lg:pl-64">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            {showSearch && onSearch && (
              <SearchBar onSearch={onSearch} placeholder="Search products..." />
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Bill Button */}
            {onOpenBill && (
              <Button
                onClick={onOpenBill}
                variant="outline"
                size="sm"
                className="relative border-gray-300 hover:bg-gray-50"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Bill ({billItemsCount})
              </Button>
            )}

            {/* User Profile */}
            <Button variant="ghost" size="sm">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}