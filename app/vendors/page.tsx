'use client';

import React from 'react';
import { VendorManagement } from '@/components/vendors/VendorManagement';
import { Header } from '@/components/Header';
import { mockVendors } from '@/components/vendors/VendorMockData';

// Mock the vendor service for preview
const mockVendorService = {
  useVendors: () => ({
    data: mockVendors,
    isLoading: false,
    refetch: () => Promise.resolve(),
  }),
  useCreateVendor: () => ({
    mutateAsync: async (data: any) => {
      console.log('Creating vendor:', data);
      return { ...data, _id: `vendor-${Date.now()}`, createdAt: new Date().toISOString() };
    },
    isPending: false,
  }),
  useUpdateVendor: () => ({
    mutateAsync: async ({ id, data }: any) => {
      console.log('Updating vendor:', id, data);
      return { ...data, _id: id, updatedAt: new Date().toISOString() };
    },
    isPending: false,
  }),
  useDeleteVendor: () => ({
    mutateAsync: async (id: string) => {
      console.log('Deleting vendor:', id);
      return;
    },
    isPending: false,
  }),
};

// Mock the vendor service module

export default function VendorManagementPreview() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSearch={false} />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <VendorManagement />
      </div>
    </div>
  );
}