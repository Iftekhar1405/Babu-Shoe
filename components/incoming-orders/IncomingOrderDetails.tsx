'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IncomingOrderComment } from '@/types';
import { 
  useIncomingOrder, 
  useUpdateIncomingOrder, 
  useAddIncomingOrderComment 
} from '@/lib/api-advance';
import { 
  ArrowLeft, 
  RefreshCw, 
  Loader2, 
  MessageSquare, 
  User, 
  Package, 
  AlertCircle 
} from 'lucide-react';

interface IncomingOrderDetailsProps {
  id: string;
}

export default function IncomingOrderDetails({ id }: IncomingOrderDetailsProps) {
  const router = useRouter();
  const [commentText, setCommentText] = useState('');

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useIncomingOrder(id);

  const updateOrderMutation = useUpdateIncomingOrder({
    onError: (error) => {
      console.error('Update failed:', error);
    },
  });

  const addCommentMutation = useAddIncomingOrderComment({
    onSuccess: () => {
      setCommentText('');
    },
    onError: (error) => {
      console.error('Add comment failed:', error);
    },
  });

  const updateProductMatched = async (productIndex: number, matchedQuantity: number) => {
    if (!order) return;

    const updatedProductDetails = order.productDetails.map((product, index) =>
      index === productIndex ? { ...product, matchedQuantity } : product
    );

    updateOrderMutation.mutate({
      id,
      data: { productDetails: updatedProductDetails },
    });
  };

  const updateOrderMetadata = async (updates: any) => {
    updateOrderMutation.mutate({
      id,
      data: updates,
    });
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    const newComment: IncomingOrderComment = {
      user: 'current-user', // This should come from auth context
      comment: commentText.trim(),
    };

    addCommentMutation.mutate({
      id,
      comment: newComment,
    });
  };

  const fillAllMatched = async (productIndex: number) => {
    if (!order) return;
    const product = order.productDetails[productIndex];
    await updateProductMatched(productIndex, product.quantity);
  };

  const calculateMatchPercentage = () => {
    if (!order?.productDetails.length) return 0;
    
    const totalQuantity = order.productDetails.reduce((sum, product) => sum + product.quantity, 0);
    const totalMatched = order.productDetails.reduce((sum, product) => sum + product.matchedQuantity, 0);
    
    return totalQuantity > 0 ? Math.round((totalMatched / totalQuantity) * 100) : 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading order details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800">
              {error instanceof Error ? error.message : 'Failed to load order details'}
            </p>
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button onClick={() => router.back()} variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Order not found</p>
          <Button onClick={() => router.back()} variant="outline" className="mt-3">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const calculatedMatchPercentage = calculateMatchPercentage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              Incoming Order #{order._id?.slice(-8)}
            </h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              calculatedMatchPercentage >= 80 
                ? 'bg-green-100 text-green-800'
                : calculatedMatchPercentage >= 50
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {calculatedMatchPercentage}% matched
            </span>
          </div>
          <p className="text-gray-600">Vendor: {order.vendorId}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={() => refetch()} variant="outline" disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {(updateOrderMutation.error || addCommentMutation.error) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <p className="text-red-800 text-sm">
              {updateOrderMutation.error instanceof Error 
                ? updateOrderMutation.error.message 
                : addCommentMutation.error instanceof Error
                ? addCommentMutation.error.message
                : 'An error occurred'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Product Details
          </h2>
          
          <div className="space-y-4">
            {order.productDetails.map((product, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.productId}</div>
                    {product.color && (
                      <div className="text-xs text-gray-600">Color: {product.color}</div>
                    )}
                    {product.sizes.length > 0 && (
                      <div className="text-xs text-gray-600">
                        Sizes: {product.sizes.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      <span className="text-gray-600">Ordered:</span>
                      <span className="font-medium ml-1">{product.quantity}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Matched Quantity
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={product.quantity}
                      value={product.matchedQuantity}
                      onChange={(e) => updateProductMatched(index, Number(e.target.value))}
                      disabled={updateOrderMutation.isPending}
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => fillAllMatched(index)}
                    disabled={updateOrderMutation.isPending}
                    className="mt-5"
                  >
                    {updateOrderMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Fill All'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Metadata */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Order Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matched By
              </label>
              <Input
                value={typeof order.matchedBy === 'string' ? order.matchedBy : order.matchedBy?.name || ''}
                onChange={(e) => updateOrderMetadata({ matchedBy: e.target.value })}
                placeholder="Enter user ID or name"
                disabled={updateOrderMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matched At
              </label>
              <Input
                type="datetime-local"
                value={order.matchedAt ? new Date(order.matchedAt).toISOString().slice(0, 16) : ''}
                onChange={(e) => updateOrderMetadata({ 
                  matchedAt: e.target.value ? new Date(e.target.value).toISOString() : undefined 
                })}
                disabled={updateOrderMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Match Percentage
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                value={order.matchPercentage || calculatedMatchPercentage}
                onChange={(e) => updateOrderMetadata({ 
                  matchPercentage: e.target.value ? Number(e.target.value) : undefined 
                })}
                disabled={updateOrderMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Image URL
              </label>
              <Input
                type="url"
                value={order.billImgUrl || ''}
                onChange={(e) => updateOrderMetadata({ billImgUrl: e.target.value })}
                placeholder="https://example.com/bill-image.jpg"
                disabled={updateOrderMutation.isPending}
              />
              {order.billImgUrl && (
                <div className="mt-3">
                  <img
                    src={order.billImgUrl}
                    alt="Bill"
                    className="max-h-48 w-auto rounded-md border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Comments ({order.comments?.length || 0})
        </h2>

        {order.comments && order.comments.length > 0 && (
          <div className="space-y-3 mb-4">
            {order.comments.map((comment, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{comment.user}</span>
                </div>
                <p className="text-sm text-gray-700">{comment.comment}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            disabled={addCommentMutation.isPending}
          />
          <Button 
            onClick={handleAddComment} 
            disabled={!commentText.trim() || addCommentMutation.isPending}
          >
            {addCommentMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Add Comment'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}