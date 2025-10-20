'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IncomingOrder } from '@/types';
import { useIncomingOrders, useDeleteIncomingOrder } from '@/lib/api-advance';
import IncomingOrderForm from './IncomingOrderForm';
import { Loader2, RefreshCw, Trash2, Eye, AlertCircle } from 'lucide-react';

interface IncomingOrdersListProps {
  className?: string;
}

export default function IncomingOrdersList({ className }: IncomingOrdersListProps) {
  const {
    data: orders = [],
    isLoading,
    error,
    refetch,
  } = useIncomingOrders();

  const deleteOrderMutation = useDeleteIncomingOrder({
    onSuccess: () => {
      // Success is handled automatically by the mutation
    },
    onError: (error) => {
      alert(`Failed to delete order: ${error.message}`);
    },
  });

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this incoming order?')) return;
    deleteOrderMutation.mutate(id);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800">
              {error instanceof Error ? error.message : 'Failed to load incoming orders'}
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Incoming Orders</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage vendor orders and track matching progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <IncomingOrderForm />
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No incoming orders found</div>
          <p className="text-gray-600 text-sm">
            Create your first incoming order to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Order #{order._id?.slice(-8)}
                    </h3>
                    {order.matchPercentage !== undefined && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.matchPercentage >= 80
                        ? 'bg-green-100 text-green-800'
                        : order.matchPercentage >= 50
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {order.matchPercentage}% matched
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Vendor:</span>
                      <div className="font-medium text-gray-900">{order.vendorId.name}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Products:</span>
                      <div className="font-medium text-gray-900">
                        {order.productDetails?.length || 0} items
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Quantity:</span>
                      <div className="font-medium text-gray-900">
                        {order.productDetails?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                      </div>
                    </div>
                  </div>

                  {order.matchedBy && (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-500">Matched by:</span>
                      <span className="ml-1 font-medium text-gray-900">
                        {typeof order.matchedBy === 'string' ? order.matchedBy : order.matchedBy.name}
                      </span>
                      {order.matchedAt && (
                        <span className="ml-2 text-gray-500">
                          on {new Date(order.matchedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Link href={`/incoming-orders/${order._id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteOrder(order._id!)}
                    disabled={deleteOrderMutation.isPending}
                  >
                    {deleteOrderMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}