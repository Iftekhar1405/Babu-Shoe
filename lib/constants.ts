import { LoginData, RegisterData, User } from "@/types/auth.type";
import { QueryClient } from "@tanstack/react-query";

export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  UNAUTHORIZED: '/unauthorized',
  ACCOUNT_INACTIVE: '/account-inactive',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    ADMIN_ONLY: '/auth/admin-only',
  },
  // ... your existing endpoints
} as const;

// types/next-auth.d.ts - Type definitions for enhanced auth
declare global {
  interface Window {
    __QUERY_CLIENT__?: QueryClient;
  }
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}