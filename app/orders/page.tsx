'use client';

import { Header } from '@/components/Header';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Package, Clock, CheckCircle, XCircle, RefreshCcw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock data updated to match the Mongoose schema
const mockOrders = [
  {
    _id: '65e3b08e50b91d2932f2c8d2',
    user: '65e3b08e50b91d2932f2c8d3',
    productDetails: [
      {
        projectId: '65e3b08e50b91d2932f2c8d4',
        quatity: 2,
        color: 'red',
        amount: 120,
        discountPercent: 10,
      },
      {
        projectId: '65e3b08e50b91d2932f2c8d5',
        quatity: 1,
        color: 'blue',
        amount: 80,
        discountPercent: 0,
      },
    ],
    mode: 'online',
    paymentMode: 'UPI',
    orderNumber: 1001,
    address: '65e3b08e50b91d2932f2c8d6',
    status: 'pending',
    phoneNumber: '9876543210',
    comments: [],
    createdAt: '2024-03-02T10:00:00.000Z',
    updatedAt: '2024-03-02T10:00:00.000Z',
  },
  {
    _id: '65e3b08e50b91d2932f2c8d7',
    user: '65e3b08e50b91d2932f2c8d8',
    productDetails: [
      {
        projectId: '65e3b08e50b91d2932f2c8d9',
        quatity: 1,
        color: 'black',
        amount: 50,
        discountPercent: 5,
      },
    ],
    mode: 'offline',
    paymentMode: 'Cash',
    orderNumber: 1002,
    address: '65e3b08e50b91d2932f2c8da',
    status: 'delivered',
    phoneNumber: '9988776655',
    comments: [],
    createdAt: '2024-03-01T15:30:00.000Z',
    updatedAt: '2024-03-01T15:30:00.000Z',
    deliveryDate: '2024-03-05T12:00:00.000Z',
  },
  {
    _id: '65e3b08e50b91d2932f2c8db',
    user: '65e3b08e50b91d2932f2c8dc',
    productDetails: [
      {
        projectId: '65e3b08e50b91d2932f2c8dd',
        quatity: 3,
        color: 'white',
        amount: 25,
        discountPercent: 0,
      },
    ],
    mode: 'online',
    paymentMode: 'credit',
    orderNumber: 1003,
    address: '65e3b08e50b91d2932f2c8de',
    status: 'cancelled',
    phoneNumber: '9999999999',
    cancelationReason: 'customer_cancel',
    cancelationDescription: 'Changed mind.',
    comments: [{ user: '65e3b08e50b91d2932f2c8dc', comment: 'Order cancelled by customer.' }],
    createdAt: '2024-02-28T09:00:00.000Z',
    updatedAt: '2024-02-28T10:00:00.000Z',
  },
];

// Helper function to get status colors based on the new schema
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
    case 'outfordeliver':
    case 'packed':
    case 'dispatched':
      return 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30';
    case 'confirmed':
      return 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30';
    case 'delivered':
      return 'bg-green-500/20 text-green-500 hover:bg-green-500/30';
    case 'cancelled':
    case 'return':
      return 'bg-red-500/20 text-red-500 hover:bg-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-500 hover:bg-gray-500/30';
  }
};

// Helper function to get status icons based on the new schema
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
    case 'outfordeliver':
    case 'packed':
    case 'dispatched':
      return <Clock className="h-4 w-4" />;
    case 'confirmed':
      return <CheckCircle className="h-4 w-4" />;
    case 'delivered':
      return <Package className="h-4 w-4" />;
    case 'cancelled':
    case 'return':
      return <XCircle className="h-4 w-4" />;
    default:
      return <RefreshCcw className="h-4 w-4" />;
  }
};

const calculateTotalAmount = (productDetails: any[]) => {
  return productDetails.reduce((sum, item) => sum + item.amount * item.quatity * (1 - item.discountPercent / 100), 0);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header showSearch={false} />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Orders"
          description="Manage customer orders and track fulfillment"
        />

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {mockOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.phoneNumber}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-2 capitalize">{order.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>${calculateTotalAmount(order.productDetails).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}