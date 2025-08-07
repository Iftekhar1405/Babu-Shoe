export interface Category {
  id: string;
  _id?: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Product<e extends boolean = true> {
  id: string;
  _id?: string;
  name: string;
  image: string;
  price: number;
  categoryId: e extends true ? Category : string;
  articleNo: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BillItem<e extends boolean = true> {
  product: Product<e>;
  quantity: number;
  discount: number;
  finalPrice: number;
}

export interface Bill<e extends boolean = true> {
  items: BillItem<e>[];
  total: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Order<e extends boolean = true> {
  id: string;
  _id?: string;
  orderNumber: number;
  customerName: string;
  customerId?: e extends true ? { name: string; id: string } : string; // optional populated customer structure
  items: BillItem<e>[];
  totalAmount: number;
  status:
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'dispatched'
  | 'outfordeliver'
  | 'delivered'
  | 'cancelled'
  | 'return';
  progress: number;
  paymentMode: 'Cash' | 'UPI' | 'Credit' | 'Debit';
  mode: 'online' | 'offline';
  address: e extends true ? { fullAddress: string; id: string } : string;
  createdAt: string;
  updatedAt?: string;
}


export type ProductDetail = {
  projectId: string; // MongoId
  quatity: number;
  color: string;
  amount: number;
  discountPercent: number;
};

export type Comment = {
  user: string; // MongoId
  comment: string;
};

export type CreateOrder = {
  user: string; // MongoId
  productDetails: ProductDetail[];
  mode: 'offline' | 'online';
  paymentMode: 'UPI' | 'Cash' | 'credit';
  orderNumber?: number;
  address: string; // MongoId
  status:
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'dispatched'
  | 'outfordeliver'
  | 'delivered'
  | 'cancelled'
  | 'return';
  cancelationReason?: 'customer_cancel' | 'inventory_issue' | 'others';
  cancelationDescription?: string;
  returnReason?: 'damaged' | 'wrong_product' | 'others';
  returnDescription?: string;
  deliveryDate?: string; // ISO Date string
  shippingPartner?: string; // MongoId
  phoneNumber: string;
  trackingId?: string;
  paidAt?: string; // ISO Date string
  comments?: Comment[];
};
