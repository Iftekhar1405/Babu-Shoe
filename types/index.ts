export interface Category {
  _id?: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ColorData {
  _id?: string;
  color?: string;
  urls?: string[];
  availableSize?: string[]
}
export interface Product<e extends boolean = true> {
  _id?: string;
  name: string;
  image: string;
  description: string;
  price: number;
  categoryId?: e extends true ? Category : string;
  articleNo: string;
  colors: Partial<ColorData[]>;
  companyId: e extends true ? { name: string, logo: string } : string;
  sizes: string[];
  inStock: boolean;
  tags: e extends true ? { _id: string, name: string }[] : string[]
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDetail<e extends boolean = true> {
  productId: Product<e>;
  quantity: number;
  color?: string;
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
  'pending',
  'confirmed',
  'packed',
  'dispatched',
  'outfordeliver',
  'delivered',
  'cancelled',
  'return',
}

export enum ORDER_MODE { 'offline', 'online' }

export enum ORDER_PAYMENT_MODE { 'UPI', 'Cash', 'credit' }

export enum ORDER_CANCELATION_REASON { 'customer_cancel', 'inventory_issue', 'others' }

export enum ORDER_RETURN_REASON { 'damaged', 'wrong_product', 'others' }

export interface Order<e extends boolean = true> {
  _id?: string;
  user?: string;
  orderNumber: number;
  customerName: string;
  customerId?: e extends true ? { name: string; _id: string } : string; // optional populated customer structure
  items: ProductDetail<e>[];
  totalAmount: number;
  status: ORDER_STATUS;
  progress: number;
  paymentMode: ORDER_PAYMENT_MODE;
  mode: ORDER_MODE;
  address?: e extends true ? { fullAddress: string; _id: string } : string;
  cancelationReason?: ORDER_CANCELATION_REASON;
  cancelationDescription?: string;
  returnReason?: ORDER_RETURN_REASON;
  returnDescription?: string;
  deliveryDate?: Date;
  phoneNumber: string;
  createdAt: string;
  updatedAt?: string;
}



export type Comment = {
  user: string; // MongoId
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
