import { AuthResponse, RegisterData, LoginData, User } from '@/types/auth.type';
import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

class AuthClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        credentials: 'include',
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AuthError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      console.error('Auth request failed:', error);
      throw new AuthError('Network error occurred', 0, { originalError: error });
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async logout(): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('/logout', {
      method: 'POST',
    });
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await this.request<User>('/profile');
    return response.data;
  }

  async getAdminData(): Promise<{ message: string; user: User }> {
    const response = await this.request<{ message: string; user: User }>('/admin-only');
    return response.data;
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const authClient = new AuthClient();
