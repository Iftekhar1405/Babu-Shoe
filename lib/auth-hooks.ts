
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { authApiClient } from './auth-api';
import { AuthResponse, LoginDto, RegisterDto, User } from '@/types/auth.type';
import { ApiError } from './api-advance';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner'; // or your preferred toast library

// Query Keys
export const authQueryKeys = {
  all: ['auth'] as const,
  profile: () => [...authQueryKeys.all, 'profile'] as const,
  adminCheck: () => [...authQueryKeys.all, 'admin-check'] as const,
} as const;

// Auth Profile Query
export const useProfile = <TData = User>(
  options?: Omit<UseQueryOptions<User, ApiError, TData>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: authQueryKeys.profile(),
    queryFn: () => authApiClient.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry if unauthorized
      if (error.status === 401) return false;
      return failureCount < 3;
    },
    ...options,
  });
};

// Admin Access Check Query
export const useAdminCheck = <TData = { message: string; user: User }>(
  options?: Omit<UseQueryOptions<{ message: string; user: User }, ApiError, TData>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: authQueryKeys.adminCheck(),
    queryFn: () => authApiClient.checkAdminAccess(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    retry: false, // Don't retry admin checks
    ...options,
  });
};

// Login Mutation
export const useLogin = (
  options?: UseMutationOptions<AuthResponse, ApiError, LoginDto>
) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (loginData: LoginDto) => authApiClient.login(loginData),
    onSuccess: (data) => {
      // Set user profile in cache
      queryClient.setQueryData(authQueryKeys.profile(), data.user);
      
      // Invalidate all queries to refresh with new auth state
      queryClient.invalidateQueries({ queryKey: ['api'] });
      
      toast?.success('Login successful!');
      router.push('/');
    },
    onError: (error) => {
      console.error('Login failed:', error);
      toast?.error(error.data?.message || 'Login failed. Please try again.');
    },
    ...options,
  });
};

// Register Mutation
export const useRegister = (
  options?: UseMutationOptions<AuthResponse, ApiError, RegisterDto>
) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (registerData: RegisterDto) => authApiClient.register(registerData),
    onSuccess: (data) => {
      // Set user profile in cache
      queryClient.setQueryData(authQueryKeys.profile(), data.user);
      
      // Invalidate all queries to refresh with new auth state
      queryClient.invalidateQueries({ queryKey: ['api'] });
      
      toast?.success('Registration successful!');
      router.push('/');
    },
    onError: (error) => {
      console.error('Registration failed:', error);
      toast?.error(error.data?.message || 'Registration failed. Please try again.');
    },
    ...options,
  });
};

// Logout Mutation
export const useLogout = (
  options?: UseMutationOptions<{ message: string }, ApiError, void>
) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApiClient.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      toast?.success('Logged out successfully!');
      router.push('/auth/login');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Even if logout fails on server, clear client cache
      queryClient.clear();
      router.push('/auth/login');
    },
    ...options,
  });
};

// Helper hook to get current auth state
export const useAuth = () => {
  const { data: user, isLoading, error, isError } = useProfile({
    retry: false,
  });

  return {
    user,
    isAuthenticated: !!user && !isError,
    isLoading,
    isError,
    error,
  };
};

// Helper hook for admin-only features
export const useIsAdmin = () => {
  const { user } = useAuth();
  return user?.role === 'admin';
};

// Helper hook for role checking
export const useHasRole = (role: string | string[]) => {
  const { user } = useAuth();
  
  if (!user) return false;
  
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  
  return user.role === role;
};