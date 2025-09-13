'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Users,
  Store,
} from 'lucide-react';
import { Vendor, VendorFilters } from '@/types/vendor.types';
import { useDeleteVendor } from '@/lib/vendor.service';
import { toast } from 'sonner';

interface VendorListProps {
  vendors: Vendor[];
  loading?: boolean;
  onEdit?: (vendor: Vendor) => void;
  onDelete?: (vendorId: string) => void;
  onView?: (vendor: Vendor) => void;
  filters?: VendorFilters;
  onFiltersChange?: (filters: VendorFilters) => void;
}

export function VendorList({
  vendors,
  loading = false,
  onEdit,
  onDelete,
  onView,
  filters = {},
  onFiltersChange,
}: VendorListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [vendorToView, setVendorToView] = useState<Vendor | null>(null);

  const deleteVendorMutation = useDeleteVendor();

  const handleSearchChange = (value: string) => {
    onFiltersChange?.({ ...filters, search: value });
  };

  const handleCityFilter = (city: string) => {
    onFiltersChange?.({ ...filters, city: city === 'all' ? undefined : city });
  };

  const handleStateFilter = (state: string) => {
    onFiltersChange?.({ ...filters, state: state === 'all' ? undefined : state });
  };

  const handleDeleteClick = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setDeleteDialogOpen(true);
  };

  const handleViewClick = (vendor: Vendor) => {
    setVendorToView(vendor);
    setViewDialogOpen(true);
    onView?.(vendor);
  };

  const confirmDelete = async () => {
    if (!vendorToDelete?._id) return;

    try {
      await deleteVendorMutation.mutateAsync(vendorToDelete._id);
      toast.success('Vendor deleted successfully');
      onDelete?.(vendorToDelete._id);
      setDeleteDialogOpen(false);
      setVendorToDelete(null);
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error('Failed to delete vendor');
    }
  };

  // Get unique cities and states for filters
  const uniqueCities = Array.from(new Set(vendors.map(v => v.city))).sort();
  const uniqueStates = Array.from(new Set(vendors.map(v => v.state))).sort();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getContactInfo = (vendor: Vendor) => {
    const phones = vendor.contact.filter(c => !c.includes('@'));
    const emails = vendor.contact.filter(c => c.includes('@'));
    return { phones, emails };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-lg">Loading vendors...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Store className="h-5 w-5" />
            <span>Vendor List</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filters.city || 'all'} onValueChange={handleCityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {uniqueCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.state || 'all'} onValueChange={handleStateFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {uniqueStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vendors Table */}
          {vendors.length === 0 ? (
            <div className="text-center py-8">
              <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No vendors found</p>
              <p className="text-muted-foreground">
                {filters.search || filters.city || filters.state
                  ? 'Try adjusting your filters'
                  : 'Add your first vendor to get started'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact Persons</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => {
                    const { phones, emails } = getContactInfo(vendor);
                    return (
                      <TableRow key={vendor._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={vendor.logo} alt={vendor.name} />
                              <AvatarFallback>
                                {vendor.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{vendor.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {vendor.address}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {phones.slice(0, 2).map((phone, index) => (
                              <div key={index} className="flex items-center space-x-1 text-sm">
                                <Phone className="h-3 w-3" />
                                <span>{phone}</span>
                              </div>
                            ))}
                            {emails.slice(0, 1).map((email, index) => (
                              <div key={index} className="flex items-center space-x-1 text-sm">
                                <Mail className="h-3 w-3" />
                                <span>{email}</span>
                              </div>
                            ))}
                            {vendor.contact.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{vendor.contact.length - 3} more
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span className="text-sm">
                              {vendor.city}, {vendor.state}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {vendor.pincode}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span className="text-sm">
                              {vendor.contactPersons.length} person(s)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {vendor.createdAt ? formatDate(vendor.createdAt) : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewClick(vendor)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(vendor)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(vendor)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vendor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{vendorToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              isLoading={deleteVendorMutation.isPending}
            >
              Delete Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Vendor Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Store className="h-5 w-5" />
              <span>Vendor Details</span>
            </DialogTitle>
          </DialogHeader>
          {vendorToView && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={vendorToView.logo} alt={vendorToView.name} />
                  <AvatarFallback>
                    {vendorToView.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{vendorToView.name}</h3>
                  <p className="text-muted-foreground">{vendorToView.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>Contact Information</span>
                  </h4>
                  <div className="space-y-1">
                    {vendorToView.contact.map((contact, index) => (
                      <div key={index} className="text-sm">
                        {contact.includes('@') ? (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{contact}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{contact}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Address</span>
                  </h4>
                  <div className="text-sm space-y-1">
                    <div>{vendorToView.address}</div>
                    <div>{vendorToView.city}, {vendorToView.district}</div>
                    <div>{vendorToView.state} - {vendorToView.pincode}</div>
                  </div>
                </div>
              </div>

              {vendorToView.contactPersons.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>Contact Persons</span>
                  </h4>
                  <div className="space-y-2">
                    {vendorToView.contactPersons.map((person, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="font-medium">{person.name}</div>
                        <div className="text-sm space-y-1 mt-1">
                          {person.contacts.map((contact, contactIndex) => (
                            <div key={contactIndex}>
                              {contact.includes('@') ? (
                                <div className="flex items-center space-x-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{contact}</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{contact}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}