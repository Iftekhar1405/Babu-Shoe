'use client';

import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShoppingBag, Bell, User, Search, Menu, LogOut, Settings, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth, useLogout } from '@/lib/auth-hooks';
import { useCurrentBill } from '@/lib/api-advance';
import { HeaderProps } from '@/types';

export function Header({
  onSearch,
  onOpenBill,
  showSearch = true,
  onMenuToggle
}: HeaderProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();

  const {
    data: bill,
    isLoading: billLoading
  } = useCurrentBill({
    enabled: isAuthenticated,
    refetchInterval: 30000, 
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Calculate bill items count
  const billItemsCount = bill?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  const billTotal = bill?.totalAmount || 0;

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

          <div className={`flex-1 max-w-md mx-4 ${showMobileSearch ? 'block' : 'hidden sm:block'}`}>
            {!showMobileSearch && showSearch && onSearch && (
              <SearchBar onSearch={onSearch} placeholder="Search products..." />
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search Toggle */}
            {showSearch && onSearch && (
              <Button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                variant="ghost"
                size="sm"
                className="sm:hidden p-2"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Bill Button - Only for authenticated users */}
            {onOpenBill && isAuthenticated && (
              <Button
                onClick={onOpenBill}
                variant="outline"
                size="sm"
                className="relative border-gray-300 hover:bg-gray-50 min-w-[100px]"
                disabled={billLoading}
              >
                <div className="flex items-center">
                  {billLoading ? (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin sm:mr-2" />
                  ) : (
                    <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                  )}
                  <span className="hidden xs:inline">Bill</span>
                  <span className="ml-1">
                    ({billItemsCount})
                  </span>
                </div>

                {/* Bill total tooltip on hover */}
                {billTotal > 0 && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₹{billTotal.toFixed(2)}
                  </div>
                )}
              </Button>
            )}

            {/* Notifications - Only for authenticated users */}
            {isAuthenticated && (
              <Button variant="ghost" size="sm" className="p-2 relative">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                {/* Notification badge */}
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
            )}

            {/* User Profile Dropdown or Auth buttons */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user?.name || user?.phoneNumber}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.phoneNumber}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(event) => {
                      event.preventDefault();
                      handleLogout();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar - Full width when expanded */}
        {showMobileSearch && showSearch && onSearch && (
          <div className="pb-3 sm:hidden">
            <SearchBar onSearch={onSearch} placeholder="Search products..." />
          </div>
        )}
      </div>
    </header>)
}