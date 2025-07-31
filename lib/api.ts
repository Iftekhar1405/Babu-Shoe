import { Category, Product, ApiResponse } from '@/types';

const API_BASE_URL = 'http://localhost:3001/api';

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
    return response.data.map(cat => ({ ...cat, id: cat._id || cat.id }));
  }

  async getCategoryById(id: string): Promise<Category> {
    const response = await this.request<Category>(`/categories/${id}`);
    return { ...response.data, id: response.data._id || response.data.id };
  }

  async createCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    const response = await this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
    return { ...response.data, id: response.data._id || response.data.id };
  }

  // Products
  async getProducts(categoryId?: string, search?: string): Promise<Product[]> {
    const params = new URLSearchParams();
    if (categoryId) params.append('category', categoryId);
    if (search) params.append('search', search);
    
    const endpoint = `/products${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.request<Product[]>(endpoint);
    return response.data.map(prod => ({ ...prod, id: prod._id || prod.id }));
  }

  async getProductById(id: string): Promise<Product> {
    const response = await this.request<Product>(`/products/${id}`);
    return { ...response.data, id: response.data._id || response.data.id };
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const response = await this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    return { ...response.data, id: response.data._id || response.data.id };
  }

  async searchProducts(query: string): Promise<Product[]> {
    const response = await this.request<Product[]>(`/products?search=${encodeURIComponent(query)}`);
    return response.data.map(prod => ({ ...prod, id: prod._id || prod.id }));
  }
}

export const apiClient = new ApiClient();