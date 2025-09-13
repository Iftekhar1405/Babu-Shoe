'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PageHeader } from '@/components/PageHeader';
import { VendorForm } from './VendorForm';
import { VendorList } from './VendorList';
import { Store, Plus, TrendingUp, Users, Building } from 'lucide-react';
import { Vendor, VendorFilters } from '@/types/vendor.types';
import { useVendors } from '@/lib/vendor.service';
import { toast } from 'sonner';

interface VendorManagementProps {
  initialFilters?: VendorFilters;
  onVendorSelect?: (vendor: Vendor) => void;
  showActions?: boolean;
  readonly?: boolean;
}

export function VendorManagement({
  initialFilters = {},
  onVendorSelect,
  showActions = true,
  readonly = false,
}: VendorManagementProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filters, setFilters] = useState<VendorFilters>(initialFilters);

  const { 
    data: vendors = [], 
    isLoading, 
    refetch 
  } = useVendors(filters);

  const handleVendorCreated = (vendor: Vendor) => {
    toast.success('Vendor created successfully');
    refetch();
    setActiveTab('list');
    onVendorSelect?.(vendor);
  };

  const handleVendorUpdated = (vendor: Vendor) => {
    toast.success('Vendor updated successfully');
    refetch();
    setIsEditDialogOpen(false);
    setEditingVendor(null);
    onVendorSelect?.(vendor);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsEditDialogOpen(true);
  };

  const handleDeleteVendor = (vendorId: string) => {
    refetch();
  };

  const handleViewVendor = (vendor: Vendor) => {
    onVendorSelect?.(vendor);
  };

  const handleFiltersChange = (newFilters: VendorFilters) => {
    setFilters(newFilters);
  };

  // Calculate stats
  const totalVendors = vendors.length;
  const uniqueCities = new Set(vendors.map(v => v.city)).size;
  const totalContactPersons = vendors.reduce((sum, vendor) => sum + vendor.contactPersons.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Management"
        description="Manage your vendor relationships and contact information"
        action={
          showActions && !readonly
            ? {
                label: 'Add Vendor',
                onClick: () => setActiveTab('add'),
              }
            : undefined
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVendors}</div>
            <p className="text-xs text-muted-foreground">
              Active vendor relationships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cities Covered</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCities}</div>
            <p className="text-xs text-muted-foreground">
              Geographic coverage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Persons</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContactPersons}</div>
            <p className="text-xs text-muted-foreground">
              Total contact persons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">
              From last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {readonly ? (
        <VendorList
          vendors={vendors}
          loading={isLoading}
          onView={handleViewVendor}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'add')}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="list">Vendor List</TabsTrigger>
            <TabsTrigger value="add">Add Vendor</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <VendorList
              vendors={vendors}
              loading={isLoading}
              onEdit={handleEditVendor}
              onDelete={handleDeleteVendor}
              onView={handleViewVendor}
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </TabsContent>

          <TabsContent value="add" className="mt-6">
            <VendorForm
              onSuccess={handleVendorCreated}
              onCancel={() => setActiveTab('list')}
              mode="create"
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Edit Vendor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {editingVendor && (
            <VendorForm
              vendor={editingVendor}
              onSuccess={handleVendorUpdated}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingVendor(null);
              }}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}