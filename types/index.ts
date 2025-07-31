export interface Category {
  id: string;
  _id?: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  image: string;
  price: number;
  categoryId: string;
  articleNo: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BillItem {
  product: Product;
  quantity: number;
  discount: number;
  finalPrice: number;
}

export interface Bill {
  items: BillItem[];
  total: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}