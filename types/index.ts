import { User } from "./auth.type";

// Re-export auth types for convenience
export { Role, type AuthResponse, type AuthState, type LoginData, type RegisterData } from './auth.type';

// Re-export chat types for convenience
export { MessageType, SearchStatus, type ChatMessage, type SearchState, type AIProductSearchProps } from './chat';

// Re-export vendor types for convenience
export {
  type Vendor,
  type CreateVendorDto,
  type UpdateVendorDto,
  type VendorFilters,
  type PaginatedVendorResponse,
  type ContactPerson
} from './vendor.types';

// Re-export transaction types for convenience
export {
  TransactionType,
  type Transaction,
  type CreateTransactionDto,
  type ReverseTransactionDto,
  type TransactionFilters,
  type PaginatedTransactionResponse,
  type ObjectId
} from './transaction.type';

// Re-export customer types for convenience
export {
  type Customer,
  type CreateCustomerDto,
  type UpdateCustomerDto,
  type CustomerFilters,
  type PaginatedCustomerResponse
} from './customer.type';

export interface Category {
  _id?: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Company {
  _id?: string;
  name: string;
  logo: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ColorData {
  _id?: string;
  color?: string;
  urls?: string[];
  availableSize?: string[];
}
export interface Product<e = true> {
  _id?: string;
  name: string;
  image: string;
  description: string;
  price: number;
  categoryId?: e extends true ? Category : string;
  articleNo: string;
  colors: Partial<ColorData[]>;
  companyId: e extends true ? { name: string; logo: string } : string;
  sizes: string[];
  inStock: boolean;
  tags: e extends true ? { _id: string; name: string }[] : string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDetail<e extends boolean = true> {
  productId: Product<e>;
  quantity: number;
  color?: string;
  size: string;
  amount?: number;
  discountPercent: number;
  finalPrice: number;
  salesPerson?: string;
}

export interface Bill<e extends boolean = true> {
  items: ProductDetail<e>[];
  totalAmount: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export enum ORDER_STATUS {
  pending = "pending",
  confirmed = "confirmed",
  packed = "packed",
  dispatched = "dispatched",
  outfordeliver = "outfordeliver",
  delivered = "delivered",
  cancelled = "cancelled",
  return = "return",
}

export enum ORDER_MODE {
  "offline",
  "online",
}

export enum ORDER_PAYMENT_MODE {
  "UPI",
  "Cash",
  "credit",
}

export enum ORDER_CANCELATION_REASON {
  "customer_cancel",
  "inventory_issue",
  "others",
}

export enum ORDER_RETURN_REASON {
  "damaged",
  "wrong_product",
  "others",
}

export interface Order<e extends boolean = true> {
  _id?: string;
  name: string;
  user?: string;
  orderNumber: number;
  customerName: string;
  customerId?: e extends true ? { name: string; _id: string } : string; // optional populated customer structure
  productDetails: ProductDetail<e>[];
  totalAmount: number;
  status: ORDER_STATUS;
  progress: number;
  paymentMode: ORDER_PAYMENT_MODE;
  mode: ORDER_MODE;
  address?: e extends true ? { fullAddress: string; _id: string } : string;
  cancelationReason?: ORDER_CANCELATION_REASON;
  cancelationDescription?: string;
  comments?: Comment[];
  returnReason?: ORDER_RETURN_REASON;
  returnDescription?: string;
  deliveryDate?: Date;
  phoneNumber: string;
  createdAt: string;
  updatedAt?: string;
}

export type Comment<e = true> = {
  user: e extends true ? User : string; // MongoId
  comment: string;
};

export type CreateOrder = {
  productDetails: ProductDetail[];
  mode: ORDER_MODE;
  paymentMode: ORDER_PAYMENT_MODE;
  address: string; // MongoId
  shippingPartner?: string; // MongoId
  phoneNumber: string;
  trackingId?: string;
  paidAt?: string; // ISO Date string
  comments?: Comment[];
};

export type Tag = {
  _id?: string;
  name: string;
};

export interface CreateOrderFromBillDto {
  name: string;
  productDetails: {
    productId: string;
    quantity: number;
    color: string;
    amount: number;
    size: string;
    discountPercent: number;
  }[];
  mode: string;
  paymentMode: string;
  address: string;
  phoneNumber: string;
}

export interface CustomerInfo {
  customerName: string;
  phoneNumber: string;
  mode: ORDER_MODE;
  paymentMode: ORDER_PAYMENT_MODE;
  address?: string;
}

export interface OrderResponse {
  _id: string;
  user: string;
  name: string;
  productDetails: {
    productId: string | { name: string; articleNo: string };
    quantity: number;
    color: string;
    amount: number;
    size: string;
    discountPercent: number;
    salesPerson?: string;
  }[];
  mode: string;
  paymentMode: string;
  orderNumber: number;
  address: string;
  status: string;
  phoneNumber: string;
  comments: any[];
  createdAt: string;
  updatedAt: string;
}

export interface HeaderProps {
  onSearch?: (query: string) => void;
  onOpenBill?: () => void;
  showSearch?: boolean;
  onMenuToggle?: () => void;
}

// Orders interface and type

export interface OrderFilters {
  search?: string;
  status?: string;
  mode?: string;
  paymentMode?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedOrderResponse {
  data: Order<true>[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Incoming Orders types based on the provided schema
export interface IncomingOrderProductDetail {
  productId: string;
  color?: string;
  sizes: string[];
  quantity: number;
  matchedQuantity: number;
}

export interface IncomingOrderComment {
  user: string;
  comment: string;
}

export interface IncomingOrder<e extends boolean = true> {
  _id?: string;
  vendorId: { _id: string, name: string, logo: string };
  productDetails: IncomingOrderProductDetail[];
  matchedBy?: e extends true ? User : string;
  matchedAt?: Date | string;
  billImgUrl?: string;
  matchPercentage?: number;
  comments: IncomingOrderComment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIncomingOrderDto {
  vendorId: string;
  productDetails: {
    productId: string;
    color?: string;
    sizes: string[];
    quantity: number;
  }[];
  billImgUrl?: string;
  matchPercentage?: number;
  comments?: IncomingOrderComment[];
}

export interface UpdateIncomingOrderDto {
  vendorId?: string;
  productDetails?: IncomingOrderProductDetail[];
  matchedBy?: string;
  matchedAt?: Date | string;
  billImgUrl?: string;
  matchPercentage?: number;
  comments?: IncomingOrderComment[];
}