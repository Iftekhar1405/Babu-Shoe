'use client'
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCcw,
  MoreHorizontal,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Download,
  Plus,
  Settings,
  MapPin,
  Phone,
  User,
  CreditCard,
  Truck,
  Edit3,
  Trash2,
  StarsIcon,
  Columns3Icon,
  TableColumnsSplit,
  TableColumnsSplitIcon
} from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { useOrdersPaginated, useOrdersStats, useUpdateOrderStatus } from '@/lib/api-advance';
import { useDebounce } from '@/hooks/use-debounce';

// Order status configuration
const ORDER_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    progress: 10
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle,
    progress: 25
  },
  packed: {
    label: 'Packed',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Package,
    progress: 50
  },
  dispatched: {
    label: 'Dispatched',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: RefreshCcw,
    progress: 70
  },
  outfordeliver: {
    label: 'Out for Delivery',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Truck,
    progress: 90
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    progress: 100
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    progress: 0
  },
  return: {
    label: 'Returned',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: RefreshCcw,
    progress: 0
  },
};

const PAYMENT_MODES = {
  UPI: { label: 'UPI', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  Cash: { label: 'Cash', color: 'bg-green-50 text-green-700 border-green-200' },
  credit: { label: 'Credit', color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

const ORDER_MODES = {
  online: { label: 'Online', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  offline: { label: 'Offline', color: 'bg-gray-50 text-gray-700 border-gray-200' },
};

// Column definitions
const COLUMNS = [
  { key: 'orderNumber', label: 'Order Number', defaultVisible: true },
  { key: 'customer', label: 'Customer', defaultVisible: true },
  { key: 'address', label: 'Address', defaultVisible: true },
  { key: 'items', label: 'Items', defaultVisible: true },
  { key: 'mode', label: 'Mode', defaultVisible: true },
  { key: 'payment', label: 'Payment', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'total', label: 'Total', defaultVisible: true },
  { key: 'date', label: 'Date', defaultVisible: false },
  { key: 'actions', label: 'Actions', defaultVisible: true }
];

export default function OrdersPage() {
  const router = useRouter();

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    mode: 'all',
    paymentMode: 'all',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    COLUMNS.reduce((acc, col) => {
      acc[col.key] = col.defaultVisible;
      return acc;
    }, {} as Record<string, boolean>)
  );

  // Debounced search to avoid excessive API calls
  const debouncedSearch = useDebounce(filters.search, 300);

  // Build filters for API
  const apiFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearch,
    status: filters.status === 'all' ? undefined : filters.status,
    mode: filters.mode === 'all' ? undefined : filters.mode,
    paymentMode: filters.paymentMode === 'all' ? undefined : filters.paymentMode,
  }), [filters, debouncedSearch]);

  // API hooks
  const {
    data: ordersResponse,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders
  } = useOrdersPaginated(apiFilters);

  const {
    data: stats,
    isLoading: statsLoading
  } = useOrdersStats();
  console.log("🪵 ~ OrdersPage ~ stats:", stats)

  const updateOrderStatusMutation = useUpdateOrderStatus();

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateOrderTotal = (productDetails: any[]) => {
    return productDetails.reduce((total, item) => {
      const discountedPrice = item.amount * (1 - item.discountPercent / 100);
      return total + (discountedPrice * item.quantity);
    }, 0);
  };

  const getStatusInfo = (status: string) => {
    return ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG] || ORDER_STATUS_CONFIG.pending;
  };

  // Column visibility functions
  const toggleColumn = (columnKey: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const toggleAllColumns = () => {
    const allVisible = COLUMNS.every(col => visibleColumns[col.key]);
    const newVisibility = COLUMNS.reduce((acc, col) => {
      acc[col.key] = !allVisible;
      return acc;
    }, {} as Record<string, boolean>);
    setVisibleColumns(newVisibility);
  };

  const resetColumns = () => {
    const defaultVisibility = COLUMNS.reduce((acc, col) => {
      acc[col.key] = col.defaultVisible;
      return acc;
    }, {} as Record<string, boolean>);
    setVisibleColumns(defaultVisibility);
  };

  const visibleColumnCount = Object.values(visibleColumns).filter(Boolean).length;
  const isAllVisible = COLUMNS.every(col => visibleColumns[col.key]);
  const isNoneVisible = COLUMNS.every(col => !visibleColumns[col.key]);

  const StatusBadge = ({ status }: { status: string }) => {
    const statusInfo = getStatusInfo(status);
    const Icon = statusInfo.icon;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className={`${statusInfo.color} flex items-center gap-1 hover:shadow-sm transition-all`}>
              <Icon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p>Status: {statusInfo.label}</p>
              <Progress value={statusInfo.progress} className="w-20 h-1" />
              <p className="text-xs">{statusInfo.progress}% Complete</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    trend?: number;
  }) => (
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{trend}% from last month
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color} transition-transform group-hover:scale-110`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </Card>
  );

  const handleStatusChange = (orderId: string, status: string) => {
    setSelectedOrder(orderId);
    setNewStatus(status);
    setShowStatusDialog(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      await updateOrderStatusMutation.mutateAsync({
        id: selectedOrder,
        status: newStatus,
        comment: `Status updated to ${getStatusInfo(newStatus).label}`,
      });
      refetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setShowStatusDialog(false);
      setSelectedOrder(null);
      setNewStatus('');
    }
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  if (ordersError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 mb-4">Failed to load orders</p>
              <Button onClick={() => refetchOrders()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Orders Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and manage customer orders with advanced filtering and analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-10 w-24 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))
        ) : stats ? (
          <>
            <StatCard
              title="Total Orders"
              value={stats.totalOrders.toLocaleString()}
              icon={ShoppingCart}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              trend={12}
            />
            <StatCard
              title="Pending Orders"
              value={stats.pendingOrders.toLocaleString()}
              icon={Clock}
              color="bg-gradient-to-br from-yellow-500 to-orange-500"
            />
            <StatCard
              title="Completed Orders"
              value={stats.completedOrders.toLocaleString()}
              icon={CheckCircle}
              color="bg-gradient-to-br from-green-500 to-emerald-600"
              trend={8}
            />
            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              icon={TrendingUp}
              color="bg-gradient-to-br from-purple-500 to-pink-600"
              trend={15}
            />
          </>
        ) : null}
      </div>

      {/* Filters Card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-xl">Advanced Filters</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({
                search: '',
                status: 'all',
                mode: 'all',
                paymentMode: 'all',
                page: 1,
                limit: 10,
                sortBy: 'createdAt',
                sortOrder: 'desc'
              })}
            >
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders, customers, phone..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
            >
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(ORDER_STATUS_CONFIG).map(([key, status]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <status.icon className="h-3 w-3" />
                      {status.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mode Filter */}
            <Select
              value={filters.mode}
              onValueChange={(value) => setFilters(prev => ({ ...prev, mode: value, page: 1 }))}
            >
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="All Modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Mode Filter */}
            <Select
              value={filters.paymentMode}
              onValueChange={(value) => setFilters(prev => ({ ...prev, paymentMode: value, page: 1 }))}
            >
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Methods</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Orders ({ordersResponse?.pagination.total || 0})
              </CardTitle>
              <CardDescription className="mt-1">
                Manage and track all customer orders
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <StarsIcon size={18} />
                </TooltipTrigger>
                <TooltipContent side="bottom" className='p-0'>
                  {/* Quick Stats Sidebar */}
                  <div className="">
                    <Card className="w-64 shadow-2xl border-0 bg-white/95 backdrop-blur-md">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Quick Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Filtered Results:</span>
                          <span className="font-semibold">{ordersResponse?.pagination.total || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Current Page:</span>
                          <span className="font-semibold">
                            {filters.page} of {ordersResponse?.pagination.totalPages || 1}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Total Value:</span>
                          <span className="font-semibold">
                            {ordersResponse?.data ? formatCurrency(
                              ordersResponse.data.reduce((sum, order) => sum + calculateOrderTotal(order.productDetails), 0)
                            ) : formatCurrency(0)}
                          </span>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700">Status Distribution:</p>
                          {ordersResponse?.data && Object.entries(
                            ordersResponse.data.reduce((acc: Record<string, number>, order) => {
                              acc[order.status] = (acc[order.status] || 0) + 1;
                              return acc;
                            }, {})
                          ).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${getStatusInfo(status).color.split(' ')[0]}`} />
                                <span className="capitalize">{status}</span>
                              </div>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TooltipContent>
              </Tooltip>

              {/* Column Visibility Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <TableColumnsSplitIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-2">
                    {/* Select/Deselect All */}
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="select-all"
                          checked={isAllVisible}
                          onCheckedChange={toggleAllColumns}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                          {isAllVisible ? 'Deselect All' : 'Select All'}
                        </label>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {visibleColumnCount}/{COLUMNS.length}
                      </Badge>
                    </div>

                    <Separator className="my-2" />

                    {/* Individual Columns */}
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {COLUMNS.map((column) => (
                        <div
                          key={column.key}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`column-${column.key}`}
                              checked={visibleColumns[column.key]}
                              onCheckedChange={() => toggleColumn(column.key)}

                            />
                            <label
                              htmlFor={`column-${column.key}`}
                              className="text-sm cursor-pointer select-none"
                            >
                              {column.label}
                            </label>
                          </div>
                          {column.defaultVisible && (
                            <Badge variant="outline" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t p-3 flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetColumns}
                      className="text-xs"
                    >
                      Reset to Default
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      {visibleColumnCount === 0 && (
                        <span className="text-red-500">At least one column must be visible</span>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="outline" size="sm" onClick={() => refetchOrders()}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ) : ordersResponse?.data && ordersResponse.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 hover:bg-gray-50">
                    {visibleColumns.orderNumber && (
                      <TableHead className="font-semibold text-gray-900">
                        <Button
                          variant="ghost"
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                          onClick={() => setFilters(prev => ({
                            ...prev,
                            sortBy: 'orderNumber',
                            sortOrder: prev.sortBy === 'orderNumber' && prev.sortOrder === 'asc' ? 'desc' : 'asc'
                          }))}
                        >
                          Order Number
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                    )}
                    {visibleColumns.customer && (
                      <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                    )}
                    {visibleColumns.address && (
                      <TableHead className="font-semibold text-gray-900">Address</TableHead>
                    )}
                    {visibleColumns.items && (
                      <TableHead className="font-semibold text-gray-900">Items</TableHead>
                    )}
                    {visibleColumns.mode && (
                      <TableHead className="font-semibold text-gray-900">Mode</TableHead>
                    )}
                    {visibleColumns.payment && (
                      <TableHead className="font-semibold text-gray-900">Payment</TableHead>
                    )}
                    {visibleColumns.status && (
                      <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    )}
                    {visibleColumns.total && (
                      <TableHead className="font-semibold text-gray-900">Total</TableHead>
                    )}
                    {visibleColumns.date && (
                      <TableHead className="font-semibold text-gray-900">Date</TableHead>
                    )}
                    {visibleColumns.actions && (
                      <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersResponse.data.map((order) => {
                    const total = calculateOrderTotal(order.productDetails);

                    return (
                      <TableRow
                        key={order._id}
                        className="hover:bg-blue-50/50 transition-colors duration-200 cursor-pointer group"
                        onClick={() => handleViewOrder(order._id || '')}
                      >
                        {visibleColumns.orderNumber && (
                          <TableCell className="font-mono font-medium ">
                            #{order.orderNumber}
                          </TableCell>
                        )}
                        {visibleColumns.customer && (
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {order.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{order.name}</p>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {order.phoneNumber}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.address && (
                          <TableCell className="max-w-xs">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-start gap-2">
                                    <MapPin className="h-3 w-3 text-muted-foreground mt-1 shrink-0" />
                                    <p className="text-sm text-muted-foreground truncate">
                                      {typeof order.address === 'string' ? order.address : 'Address not available'}
                                    </p>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>{typeof order.address === 'string' ? order.address : 'Address not available'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        )}
                        {visibleColumns.items && (
                          <TableCell>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                              {order.productDetails.length} items
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.mode && (
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={ORDER_MODES[order.mode as unknown as keyof typeof ORDER_MODES]?.color}
                            >
                              {ORDER_MODES[order.mode as unknown as keyof typeof ORDER_MODES]?.label || order.mode}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.payment && (
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={PAYMENT_MODES[order.paymentMode as unknown as keyof typeof PAYMENT_MODES]?.color}
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              {PAYMENT_MODES[order.paymentMode as unknown as keyof typeof PAYMENT_MODES]?.label || order.paymentMode}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell>
                            <StatusBadge status={order.status} />
                          </TableCell>
                        )}
                        {visibleColumns.total && (
                          <TableCell className="font-semibold text-gray-900">
                            {formatCurrency(total)}
                          </TableCell>
                        )}
                        {visibleColumns.date && (
                          <TableCell className="text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(order.createdAt)}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.actions && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewOrder(order._id || "");
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View Details</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleViewOrder(order._id || '')}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                  {Object.entries(ORDER_STATUS_CONFIG)
                                    .filter(([key]) => key !== order.status)
                                    .slice(0, 3)
                                    .map(([key, config]) => (
                                      <DropdownMenuItem
                                        key={key}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStatusChange(order._id || "", key);
                                        }}
                                      >
                                        <config.icon className="h-4 w-4 mr-2" />
                                        Mark as {config.label}
                                      </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                  <p className="text-muted-foreground mb-4">
                    {(filters.search || filters.status !== 'all' || filters.mode !== 'all' || filters.paymentMode !== 'all')
                      ? 'Try adjusting your filters to see more results.'
                      : 'Get started by creating your first order.'}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      search: '',
                      status: 'all',
                      mode: 'all',
                      paymentMode: 'all',
                      page: 1,
                      limit: 10,
                      sortBy: 'createdAt',
                      sortOrder: 'desc'
                    })}
                    className="gap-2"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {ordersResponse?.data && ordersResponse.data.length > 0 && (
            <div className="flex items-center justify-between p-6 border-t bg-gray-50/50">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{((filters.page - 1) * filters.limit) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(filters.page * filters.limit, ordersResponse.pagination.total)}</span> of{' '}
                  <span className="font-medium">{ordersResponse.pagination.total}</span> orders
                </p>
                <Select
                  value={filters.limit.toString()}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, limit: parseInt(value), page: 1 }))}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">per page</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={filters.page <= 1}
                  className="gap-2"
                >
                  <ChevronUp className="h-4 w-4 rotate-[-90deg]" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, ordersResponse.pagination.totalPages))].map((_, i) => {
                    let pageNum: number;
                    if (ordersResponse.pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (filters.page <= 3) {
                      pageNum = i + 1;
                    } else if (filters.page > ordersResponse.pagination.totalPages - 3) {
                      pageNum = ordersResponse.pagination.totalPages - 4 + i;
                    } else {
                      pageNum = filters.page - 2 + i;
                    }

                    const isActive = pageNum === filters.page;
                    return (
                      <Button
                        key={pageNum}
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={`h-8 w-8 p-0 ${isActive ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                        onClick={() => setFilters(prev => ({ ...prev, page: pageNum }))}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    page: Math.min(ordersResponse.pagination.totalPages, prev.page + 1)
                  }))}
                  disabled={filters.page >= ordersResponse.pagination.totalPages}
                  className="gap-2"
                >
                  Next
                  <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Change Confirmation Dialog */}
      <Dialog
        open={showStatusDialog}
        onOpenChange={(open) => {
          if (!updateOrderStatusMutation.isPending) {
            setShowStatusDialog(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Confirm Status Change
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to update the order status to{' '}
              <span className="font-semibold">
                {newStatus ? getStatusInfo(newStatus).label : ''}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
              className="flex-1"
              disabled={updateOrderStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusChange}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={updateOrderStatusMutation.isPending}
            >
              {updateOrderStatusMutation.isPending ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Update
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}