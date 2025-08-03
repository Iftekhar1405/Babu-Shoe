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

export interface BillItem {
  product: Product<true>;
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