'use client';

import { Header } from '@/components/Header';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Eye, Loader } from 'lucide-react';
import { useCustomers } from '@/lib/api-advance';


export default function CustomersPage() {

  const { data: customers, isLoading } = useCustomers()



  if (isLoading) {
    return <Loader className='animate-spin' />
  }

  if (!isLoading && (!customers || !customers?.length)) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No customers found.</p>
      </div>
    )
  }

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
          {customers && customers.map((customer) => {
            const user = customer.userId;
            return (
              <Card key={customer._id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Left Section */}
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-lg font-semibold text-gray-600">
                          {user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold">
                          {user?.name || "N/A"}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{user?.phoneNumber || customer.contact}</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-1 sm:mt-0">
                            <MapPin className="h-4 w-4" />
                            <span>{customer.address || "No address"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          ₹{customer.creditLimit.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">Credit Limit</p>
                      </div>

                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          ₹{customer.creditBalance.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">Credit Balance</p>
                      </div>

                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          ₹{customer.currentBalance.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">Current Balance</p>
                      </div>

                      <div className="flex flex-col items-center space-y-2">
                        <Badge
                          className={
                            customer.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }
                        >
                          {customer.isActive ? "Active" : "Inactive"}
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
            );
          })}
        </div>

      </div>
    </div>

  );
}