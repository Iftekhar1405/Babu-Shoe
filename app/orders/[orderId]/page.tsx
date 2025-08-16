'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    ArrowLeft,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    RefreshCw,
    User,
    MapPin,
    Phone,
    Calendar,
    CreditCard,
    Truck,
    MessageSquare,
    Edit,
    Save,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrder, useUpdateOrderStatus } from '@/lib/api-advance';

// Order status configuration
const ORDER_STATUS_CONFIG = {
    pending: {
        label: 'Pending',
        color: 'bg-yellow-500/20 text-yellow-600',
        icon: Clock,
        bgColor: 'bg-yellow-500'
    },
    confirmed: {
        label: 'Confirmed',
        color: 'bg-blue-500/20 text-blue-600',
        icon: CheckCircle,
        bgColor: 'bg-blue-500'
    },
    packed: {
        label: 'Packed',
        color: 'bg-purple-500/20 text-purple-600',
        icon: Package,
        bgColor: 'bg-purple-500'
    },
    dispatched: {
        label: 'Dispatched',
        color: 'bg-indigo-500/20 text-indigo-600',
        icon: RefreshCw,
        bgColor: 'bg-indigo-500'
    },
    outfordeliver: {
        label: 'Out for Delivery',
        color: 'bg-orange-500/20 text-orange-600',
        icon: Truck,
        bgColor: 'bg-orange-500'
    },
    delivered: {
        label: 'Delivered',
        color: 'bg-green-500/20 text-green-600',
        icon: CheckCircle,
        bgColor: 'bg-green-500'
    },
    cancelled: {
        label: 'Cancelled',
        color: 'bg-red-500/20 text-red-600',
        icon: XCircle,
        bgColor: 'bg-red-500'
    },
    return: {
        label: 'Returned',
        color: 'bg-gray-500/20 text-gray-600',
        icon: RefreshCw,
        bgColor: 'bg-gray-500'
    },
};

interface OrderDetailsPageProps {
    orderId: string;
}

export default function OrderDetailsPage({ orderIds }: OrderDetailsPageProps) {
    console.log("🪵 ~ OrderDetailsPage ~ orderIds:", orderIds)
    const orderId = window.location.pathname.split("/").pop()
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editingComment, setEditingComment] = useState('');
    const {
        data: order,
        isLoading,
        error,
        refetch
    } = useOrder(orderId);
    console.log("🪵 ~ OrderDetailsPage ~ order:", order)
    console.log("🪵 ~ OrderDetailsPage ~ error:", error)

    const updateOrderStatusMutation = useUpdateOrderStatus();

    // Helper functions
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const formatDate = (date: string | Date | null) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const calculateOrderTotal = () => {
        if (!order?.productDetails) return 0;
        return order.productDetails.reduce((total, item) => {
            const discountedPrice = item.amount * (1 - item.discountPercent / 100);
            return total + (discountedPrice * item.quatity);
        }, 0);
    };

    const getStatusInfo = (status: string) => {
        return ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG] || ORDER_STATUS_CONFIG.pending;
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!order) return;

        try {
            await updateOrderStatusMutation.mutateAsync({
                id: order._id,
                status: newStatus,
                comment: `Status updated to ${getStatusInfo(newStatus).label}`,
            });
            refetch();
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    };

    const handleAddComment = async () => {
        if (!order || !editingComment.trim()) return;

        try {
            await updateOrderStatusMutation.mutateAsync({
                id: order._id,
                status: order.status,
                comment: editingComment,
            });
            setEditingComment('');
            setIsEditing(false);
            refetch();
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    const OrderStatusTracker = ({ status }: { status: string }) => {
        const statuses = ['pending', 'confirmed', 'packed', 'dispatched', 'outfordeliver', 'delivered'];
        const currentIndex = statuses.indexOf(status);
        const progress = status === 'cancelled' || status === 'return'
            ? 0
            : ((currentIndex + 1) / statuses.length) * 100;

        return (
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                Order Status
                                <Badge className={getStatusInfo(status).color}>
                                    {React.createElement(getStatusInfo(status).icon, { className: "h-3 w-3" })}
                                    {getStatusInfo(status).label}
                                </Badge>
                            </CardTitle>
                            <CardDescription>Track the current status of the order</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            {/* Status Update Buttons */}
                            {Object.entries(ORDER_STATUS_CONFIG)
                                .filter(([key]) => key !== status)
                                .slice(0, 3)
                                .map(([key, config]) => (
                                    <Button
                                        key={key}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusUpdate(key)}
                                        disabled={updateOrderStatusMutation.isPending}
                                        className="text-xs"
                                    >
                                        {React.createElement(config.icon, { className: "h-3 w-3 mr-1" })}
                                        {config.label}
                                    </Button>
                                ))}
                        </div>
                    </div>
                </CardHeader>
                {status !== 'cancelled' && status !== 'return' && (
                    <CardContent>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-3 rounded-full" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-3">
                            {statuses.map((s, i) => (
                                <span
                                    key={s}
                                    className={cn(
                                        'capitalize transition-colors duration-300',
                                        i <= currentIndex ? 'text-foreground font-semibold' : ''
                                    )}
                                >
                                    {s.replace('outfordeliver', 'out for delivery')}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                )}
            </Card>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-6xl mx-auto p-6 space-y-6">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-64 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-6xl mx-auto p-6">
                    <div className="text-center py-12">
                        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-500 mb-4">Failed to load order details</p>
                        <div className="flex gap-4 justify-center">
                            <Button onClick={() => refetch()}>Try Again</Button>
                            <Button variant="outline" onClick={() => router.back()}>
                                Go Back
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const totalAmount = calculateOrderTotal();

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Orders
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
                            <p className="text-muted-foreground">
                                Placed on {formatDate(order.createdAt)}
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => refetch()} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>

                {/* Status Tracker */}
                <OrderStatusTracker status={order.status} />

                {/* Order Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">{order.name}</p>
                                    <p className="text-sm text-muted-foreground">Customer</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{order.phoneNumber}</span>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm font-medium">Delivery Address</p>
                                    <p className="text-sm text-muted-foreground">
                                        {typeof order.address === 'string' ? order.address : 'Address not available'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Order Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Order Mode</p>
                                    <Badge variant="secondary" className="mt-1">
                                        {order.mode}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Payment Method</p>
                                    <Badge variant="secondary" className="mt-1">
                                        {order.paymentMode}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Total Amount</p>
                                <p className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Order Date</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                                </div>
                            </div>

                            {order.deliveryDate && (
                                <div className="flex items-center gap-3">
                                    <Truck className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Delivery Date</p>
                                        <p className="text-sm text-muted-foreground">{formatDate(order.deliveryDate)}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Separator />

                {/* Products Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Items ({order.productDetails.length} items)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Product</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Color</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Quantity</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Unit Price</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Discount</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {order.productDetails.map((item, index) => {
                                        const discountedPrice = item.amount * (1 - item.discountPercent / 100);
                                        const itemTotal = discountedPrice * item.quatity;

                                        return (
                                            <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        {item.productId?.image && (
                                                            <img
                                                                src={item.productId.image}
                                                                alt={item.productId.name || 'Product'}
                                                                className="h-12 w-12 rounded-md object-cover"
                                                            />
                                                        )}
                                                        <div>
                                                            <p className="font-medium">
                                                                {item.productId?.name || 'Unknown Product'}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {item.productId?.description || ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <Badge variant="outline">{item.color}</Badge>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <Badge variant="secondary">{item.quatity}</Badge>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div>
                                                        <p className="font-medium">{formatCurrency(item.amount)}</p>
                                                        {item.discountPercent > 0 && (
                                                            <p className="text-sm text-green-600">
                                                                After discount: {formatCurrency(discountedPrice)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    {item.discountPercent > 0 ? (
                                                        <Badge variant="destructive" className="bg-green-500/20 text-green-600">
                                                            {item.discountPercent}% OFF
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">No discount</span>
                                                    )}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <p className="font-semibold">{formatCurrency(itemTotal)}</p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Order Summary */}
                        <div className="mt-6 pt-6 border-t">
                            <div className="flex justify-end">
                                <div className="w-full max-w-md space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal:</span>
                                        <span>{formatCurrency(totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Tax:</span>
                                        <span>Included</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Shipping:</span>
                                        <span>Free</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total:</span>
                                        <span>{formatCurrency(totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Shipping Information */}
                {(order.shippingPartner || order.trackingId) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" />
                                Shipping Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.shippingPartner && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Shipping Partner</p>
                                    <p className="font-medium">{order.shippingPartner}</p>
                                </div>
                            )}
                            {order.trackingId && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Tracking ID</p>
                                    <div className="flex items-center gap-2">
                                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                                            {order.trackingId}
                                        </code>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigator.clipboard.writeText(order.trackingId || '')}
                                        >
                                            Copy
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Comments Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Comments ({order.comments?.length || 0})
                            </CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                                {isEditing ? 'Cancel' : 'Add Comment'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Add Comment Form */}
                        {isEditing && (
                            <div className="p-4 bg-muted/20 rounded-lg border border-dashed">
                                <div className="space-y-3">
                                    <Textarea
                                        placeholder="Add a comment about this order..."
                                        value={editingComment}
                                        onChange={(e) => setEditingComment(e.target.value)}
                                        className="min-h-[100px] resize-none"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={handleAddComment}
                                            disabled={!editingComment.trim() || updateOrderStatusMutation.isPending}
                                        >
                                            {updateOrderStatusMutation.isPending ? (
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4 mr-2" />
                                            )}
                                            Save Comment
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setEditingComment('');
                                                setIsEditing(false);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Existing Comments */}
                        {order.comments && order.comments.length > 0 ? (
                            <div className="space-y-4">
                                {order.comments.map((comment, index) => (
                                    <div key={index} className="p-4 bg-muted/10 rounded-lg border">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <User className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {typeof comment.user === 'string' ? comment.user : comment.user?.name || 'System'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(new Date())}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground ml-10">
                                            {comment.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No comments yet</p>
                                <p className="text-sm">Add a comment to track order progress</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Orders
                    </Button>
                    <Button onClick={() => window.print()} variant="outline">
                        Print Order
                    </Button>
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <Button
                            onClick={() => {
                                const nextStatus = order.status === 'pending' ? 'confirmed' :
                                    order.status === 'confirmed' ? 'packed' :
                                        order.status === 'packed' ? 'dispatched' :
                                            order.status === 'dispatched' ? 'outfordeliver' :
                                                order.status === 'outfordeliver' ? 'delivered' : order.status;
                                if (nextStatus !== order.status) {
                                    handleStatusUpdate(nextStatus);
                                }
                            }}
                            disabled={updateOrderStatusMutation.isPending}
                        >
                            {updateOrderStatusMutation.isPending ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Advance Status
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}