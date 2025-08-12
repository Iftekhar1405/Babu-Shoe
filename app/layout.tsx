import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/Sidebar';
import { DETAILS } from '@/public/details';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { Toaster } from 'sonner'; // For notifications
import { AuthProvider } from '@/context/auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: DETAILS.NAME,
  description: DETAILS.DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50">
              <Sidebar />
              <main className="lg:pl-64">
                {children}
              </main>
            </div>
            <Toaster position="top-right" />
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}