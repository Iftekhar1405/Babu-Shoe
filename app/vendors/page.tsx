'use client';

import React from 'react';
import { VendorManagement } from '@/components/vendors/VendorManagement';
import { Header } from '@/components/Header';


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