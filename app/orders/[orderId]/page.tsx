// OrderDetailsPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Mock order data (use your original mockOrderData object here)
const mockOrderData = {
    _id: '65f6d7a8b9c0d1e2f3a4b5c6',
    user: '65f6d7a8b9c0d1e2f3a4b5c7', // Mock User ID
    userName: 'John Doe', // Added for display
    userEmail: 'john.doe@example.com', // Added as an 'article' equivalent for user
    productDetails: [
        {
            projectId: '65f6d7a8b9c0d1e2f3a4b5c8', // Mock Project ID
            productName: 'Premium Wireless Headphones', // Added for display
            productArticle: 'High-fidelity audio with noise cancellation.', // Added as an 'article' equivalent for product
            quatity: 2,
            color: 'Black',
            amount: 1200.00,
            discountPercent: 10,
        },
        {
            projectId: '65f6d7a8b9c0d1e2f3a4b5c9', // Mock Project ID
            productName: 'Ergonomic Desk Chair',
            productArticle: 'Adjustable lumbar support for ultimate comfort.',
            quatity: 1,
            color: 'White',
            amount: 800.00,
            discountPercent: 0,
        },
        {
            projectId: '65f6d7a8b9c0d1e2f3a4b5ca', // Mock Project ID
            productName: 'Smart Home Hub',
            productArticle: 'Central control for all your smart devices.',
            quatity: 3,
            color: 'Blue',
            amount: 500.00,
            discountPercent: 5,
        },
    ],
    mode: 'online',
    paymentMode: 'UPI',
    orderNumber: 10012345,
    address: '65f6d7a8b9c0d1e2f3a4b5cb', // Mock Address ID
    addressDetails: { // Added for display
        name: 'Home Address',
        fullAddress: '123, Main Street, Anytown, State - 123456', // Added as an 'article' equivalent for address
    },
    status: 'packed', // Current status for demonstration
    phoneNumber: '+919876543210',
    deliveryDate: null, // Will be set if delivered
    shippingPartner: null, // Will be set if dispatched
    shippingPartnerName: 'FastShip Logistics', // Added for display
    shippingPartnerContact: 'contact@fastship.com', // Added as an 'article' equivalent for shipping partner
    trackingId: null, // Will be set if dispatched
    paidAt: new Date('2025-08-01T10:30:00Z'),
    comments: [
        {
            user: '65f6d7a8b9c0d1e2f3a4b5cc', // Mock User ID
            commentUserName: 'Admin User', // Added for display
            comment: 'Customer requested expedited delivery.',
        },
        {
            user: '65f6d7a8b9c0d1e2f3a4b5cd', // Mock User ID
            commentUserName: 'Warehouse Manager', // Added for display
            comment: 'Packaging team confirmed item availability.',
        },
    ],
    createdAt: new Date('2025-08-01T09:00:00Z'),
    updatedAt: new Date('2025-08-01T11:45:00Z'),
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
}).format(amount);

const formatDate = (date: Date | string | null) => {
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

function OrderStatusTracker({ status }: { status: string }) {
    const statuses = [
        'pending',
        'confirmed',
        'packed',
        'dispatched',
        'outfordeliver',
        'delivered',
        'cancelled',
        'return',
    ];
    const currentIndex = statuses.indexOf(status);
    const mainFlow = statuses.slice(0, 6);
    const progress = ((mainFlow.indexOf(status) + 1) / mainFlow.length) * 100;

    return (
        <Card className="mb-6 w-full shadow-md">
            <CardHeader>
                <CardTitle>Order Status</CardTitle>
                <p className="text-sm text-muted-foreground">Track the current status of the order</p>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{status.replace(/outfordeliver/, 'out for delivery')}</span>
                    <span className="text-sm font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3 rounded-full" />
                <div className="flex justify-between text-xs text-muted-foreground mt-3">
                    {mainFlow.map((s, i) => (
                        <span
                            key={s}
                            className={cn(
                                'capitalize transition-colors duration-300',
                                i <= currentIndex ? 'text-black font-semibold' : ''
                            )}
                        >
                            {s.replace(/outfordeliver/, 'out for delivery')}
                        </span>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}


export default function OrderDetailsPage() {
    const [order, setOrder] = useState<typeof mockOrderData | null>(null);

    useEffect(() => {
        setOrder(mockOrderData);
    }, []);

    if (!order) {
        return <div className="p-10"><Skeleton className="w-full h-96" /></div>;
    }

    const totalAmount = order.productDetails.reduce((acc, item) => {
        const discounted = item.amount * (1 - item.discountPercent / 100);
        return acc + item.quatity * discounted;
    }, 0);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Order #{order.orderNumber}</h1>

            <OrderStatusTracker status={order.status} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                        <CardDescription>Details of the customer and payment</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><strong>Customer:</strong> {order.userName} ({order.userEmail})</p>
                        <p><strong>Phone:</strong> {order.phoneNumber}</p>
                        <p><strong>Order Mode:</strong> {order.mode}</p>
                        <p><strong>Payment Mode:</strong> {order.paymentMode}</p>
                        <p><strong>Total:</strong> {formatCurrency(totalAmount)}</p>
                        <p><strong>Ordered At:</strong> {formatDate(order.createdAt)}</p>
                        <p><strong>Paid At:</strong> {formatDate(order.paidAt)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Info</CardTitle>
                        <CardDescription>Delivery details and partner</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><strong>Address:</strong> {order.addressDetails.name}</p>
                        <p className="text-muted-foreground text-xs">{order.addressDetails.fullAddress}</p>
                        <p><strong>Status:</strong> <Badge variant={order.status === 'cancelled' ? 'destructive' : 'default'}>{order.status}</Badge></p>
                        <p><strong>Shipping Partner:</strong> {order.shippingPartnerName || 'N/A'}</p>
                        <p><strong>Tracking ID:</strong> {order.trackingId || 'N/A'}</p>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>Products</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <ScrollArea className="w-full">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Color</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.productDetails.map((p, idx) => {
                                    const discounted = p.amount * (1 - p.discountPercent / 100);
                                    const total = p.quatity * discounted;
                                    return (
                                        <TableRow key={idx}>
                                            <TableCell>{p.productName}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground max-w-sm truncate">{p.productArticle}</TableCell>
                                            <TableCell>{p.quatity}</TableCell>
                                            <TableCell>{p.color}</TableCell>
                                            <TableCell>{formatCurrency(p.amount)}</TableCell>
                                            <TableCell>{p.discountPercent}%</TableCell>
                                            <TableCell className="font-semibold">{formatCurrency(total)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Comments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    {order.comments.length > 0 ? order.comments.map((c, idx) => (
                        <div key={idx} className="p-3 bg-muted/20 rounded-md border border-muted">
                            <p className="font-medium text-foreground">{c.commentUserName}:</p>
                            <p>{c.comment}</p>
                        </div>
                    )) : <p className="text-muted-foreground">No comments</p>}
                </CardContent>
            </Card>
        </div>
    );
};

