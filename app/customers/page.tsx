'use client';

import { Header } from '@/components/Header';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Eye } from 'lucide-react';

const mockCustomers = [
  {
    id: 'CUST-001',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    orders: 12,
    totalSpent: 2450.00,
    status: 'active',
    joinDate: '2023-06-15',
  },
  {
    id: 'CUST-002',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 (555) 987-6543',
    location: 'Los Angeles, CA',
    orders: 8,
    totalSpent: 1890.50,
    status: 'active',
    joinDate: '2023-08-22',
  },
  {
    id: 'CUST-003',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '+1 (555) 456-7890',
    location: 'Chicago, IL',
    orders: 5,
    totalSpent: 750.25,
    status: 'inactive',
    joinDate: '2023-11-10',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSearch={false} />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Customers"
          description="Manage your customer relationships and data"
        />

        {/* Customers List */}
        <div className="space-y-4">
          {mockCustomers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-600">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{customer.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{customer.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{customer.orders}</p>
                      <p className="text-sm text-gray-600">Orders</p>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold">${customer.totalSpent.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Total Spent</p>
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                      <Badge className={getStatusColor(customer.status)}>
                        {customer.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {mockCustomers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No customers found.</p>
          </div>
        )}
      </div>
    </div>
  );
}