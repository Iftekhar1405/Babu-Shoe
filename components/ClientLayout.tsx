'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if we're on auth pages where sidebar shouldn't show
  const isAuthPage = pathname?.endsWith('/login') || pathname?.endsWith('/register');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className={isAuthPage ? '' : 'lg:ml-64'}>
        {children}
      </main>
    </div>
  );
}