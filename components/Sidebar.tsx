'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Package,
  Grid3X3,
  Settings,
  Menu,
  ShoppingBag,
  BarChart3,
  Users,
  Factory,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { DETAILS } from '@/public/details';
import { useAuth } from '@/lib/auth-hooks';
import { useLogout } from '@/lib/auth-hooks';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    name: 'Products',
    href: '/products',
    icon: Package,
  },
  {
    name: 'Companies',
    href: '/companies',
    icon: Factory,
  },
  {
    name: 'Categories',
    href: '/categories',
    icon: Grid3X3,
  },
  {
    name: 'Orders',
    href: '/orders',
    icon: ShoppingBag,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    name: 'Management',
    href: '/management',
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
            {DETAILS.ICON}
          </div>
          <span className="text-xl font-bold">{DETAILS.NAME}</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer with User Info */}
      <div className="border-t p-4">
        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-auto p-3">
                <div className="flex items-center space-x-3 w-full">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.phoneNumber}
                    </p>
                    <p className="text-xs text-blue-600 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="w-full cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="w-full cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500">Not logged in</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn('hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0', className)}>
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-y-auto">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md hover:bg-gray-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}