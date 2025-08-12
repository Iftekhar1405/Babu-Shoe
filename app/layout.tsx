// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { DETAILS } from '@/public/details';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { AuthProvider } from '@/hooks/use_authContext';
import { Toaster } from 'sonner'; // or your preferred toast library

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
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}