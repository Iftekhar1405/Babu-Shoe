import { authClient, AuthError } from '@/lib/auth-client';
import { AuthResponse, LoginData, RegisterData, User } from '@/types/auth.type';
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Query Keys
export const authQueryKeys = {
  all: ['auth'] as const,
  user: () => [...authQueryKeys.all, 'user'] as const,
  profile: () => [...authQueryKeys.all, 'profile'] as const,
} as const;

// Auth Queries
export const useAuth = (
  options?: Omit<UseQueryOptions<User, AuthError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: authQueryKeys.profile(),
    queryFn: () => authClient.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's an auth error (401, 403)
      if (error.status === 401 || error.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
};

// Auth Mutations
export const useRegister = (
  options?: UseMutationOptions<AuthResponse, AuthError, RegisterData>
) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterData) => authClient.register(data),
    onSuccess: (response) => {
      // Set user data in cache
      queryClient.setQueryData(authQueryKeys.profile(), response.user);
      
      // Show success message
      toast.success('Registration successful!');
      
      // Redirect to dashboard or home
      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('Registration failed:', error);
      toast.error(error.message || 'Registration failed');
    },
    ...options,
  });
};

export const useLogin = (
  options?: UseMutationOptions<AuthResponse, AuthError, LoginData>
) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginData) => authClient.login(data),
    onSuccess: (response) => {
      // Set user data in cache
      queryClient.setQueryData(authQueryKeys.profile(), response.user);
      
      // Show success message
      toast.success('Login successful!');
      
      // Redirect to dashboard or intended page
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
      router.push(returnUrl || '/dashboard');
    },
    onError: (error) => {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed');
    },
    ...options,
  });
};

export const useLogout = (
  options?: UseMutationOptions<{ message: string }, AuthError, void>
) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authClient.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Redirect to login
      router.push('/login');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Even if logout fails on server, clear local cache
      queryClient.clear();
      router.push('/login');
    },
    ...options,
  });
};