import { Category, Product, ApiResponse, Order } from '@/types';

const API_BASE_URL = 'http://localhost:8080/api';

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await this.request<Category[]>('/categories');
    return response.data.map(cat => ({ ...cat, }));
  }

  async getCategoryById(id: string): Promise<Category> {
    const response = await this.request<Category>(`/categories/${id}`);
    return { ...response.data };
  }

  async createCategory(category: Category): Promise<Category> {
    const response = await this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
    return { ...response.data };
  }

  // Products
  async getProducts(categoryId?: string, search?: string): Promise<Product<true>[]> {
    const params = new URLSearchParams();
    if (categoryId) params.append('category', categoryId);
    if (search) params.append('search', search);

    const endpoint = `/products${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.request<Product<true>[]>(endpoint);
    return response.data.map(prod => ({ ...prod, }));
  }

  async getProductById(id: string): Promise<Product> {
    const response = await this.request<Product>(`/products/${id}`);
    return { ...response.data, };
  }

  async createProduct(product: Product): Promise<Product> {
    const response = await this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    return { ...response.data, };
  }

  async searchProducts(query: string): Promise<Product[]> {
    const response = await this.request<Product[]>(`/products?search=${encodeURIComponent(query)}`);
    return response.data.map(prod => ({ ...prod, }));
  }

  async uploadImagesLegacy(formData: FormData) {
    const response = await fetch('http://localhost:8080/api/upload/images-legacy', {
      method: 'POST',
      body: formData,
    });
    return response.json();
  }

  // Orders
  async getOrders(): Promise<Order<true>[]> {
    const response = await this.request<Order<true>[]>('/orders');
    return response.data.map(order => ({ ...order, }));
  }

  async getOrderById(id: string): Promise<Order<true>> {
    const response = await this.request<Order<true>>(`/orders/${id}`);
    return { ...response.data, };
  }

  async createOrder(order: Omit<Order<false>, 'id' | 'createdAt'>): Promise<Order<true>> {
    const response = await this.request<Order<true>>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
    return { ...response.data, };
  }

  async updateOrder(
    id: string,
    orderUpdates: Partial<Order<false>>
  ): Promise<Order<true>> {
    const response = await this.request<Order<true>>(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(orderUpdates),
    });
    return { ...response.data, };
  }

}

export const apiClient = new ApiClient();