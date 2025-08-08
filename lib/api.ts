// import {
//   useQuery,
//   useMutation,
//   useQueryClient,
//   UseQueryOptions,
//   UseMutationOptions,
// } from '@tanstack/react-query';
// import { Category, Product, ApiResponse, Order } from '@/types';

// const API_BASE_URL = 'http://localhost:8080/api';

// // Simple Query Keys
// const KEYS = {
//   categories: ['categories'],
//   category: (id: string) => ['categories', id],
//   products: ['products'],
//   product: (id: string) => ['products', id],
//   orders: ['orders'],
//   order: (id: string) => ['orders', id],
// };

// // Simple API Client
// class SimpleApiClient {
//   private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
//     const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//       headers: { 'Content-Type': 'application/json', ...options?.headers },
//       ...options,
//     });

//     if (!response.ok) {
//       throw new Error(`API Error: ${response.status}`);
//     }

//     const result: ApiResponse<T> = await response.json();
//     return result.data;
//   }

//   // Categories
//   getCategories = () => this.request<Category[]>('/categories');
//   getCategory = (id: string) => this.request<Category>(`/categories/${id}`);
//   createCategory = (data: Omit<Category, 'id'>) =>
//     this.request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) });
//   updateCategory = (id: string, data: Partial<Category>) =>
//     this.request<Category>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
//   deleteCategory = (id: string) =>
//     this.request<void>(`/categories/${id}`, { method: 'DELETE' });

//   // Products
//   getProducts = (params?: { categoryId?: string; search?: string }) => {
//     const query = new URLSearchParams();
//     if (params?.categoryId) query.set('category', params.categoryId);
//     if (params?.search) query.set('search', params.search);
//     return this.request<Product<true>[]>(`/products?${query}`);
//   };

//   getProduct = (id: string) => this.request<Product>(`/products/${id}`);
//   createProduct = (data: Omit<Product, 'id'>) =>
//     this.request<Product>('/products', { method: 'POST', body: JSON.stringify(data) });
//   updateProduct = (id: string, data: Partial<Product>) =>
//     this.request<Product>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
//   deleteProduct = (id: string) =>
//     this.request<void>(`/products/${id}`, { method: 'DELETE' });

//   // Orders
//   getOrders = () => this.request<Order<true>[]>('/orders');
//   getOrder = (id: string) => this.request<Order<true>>(`/orders/${id}`);
//   createOrder = (data: Omit<Order<false>, 'id' | 'createdAt'>) =>
//     this.request<Order<true>>('/orders', { method: 'POST', body: JSON.stringify(data) });
//   updateOrder = (id: string, data: Partial<Order<false>>) =>
//     this.request<Order<true>>(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
//   deleteOrder = (id: string) =>
//     this.request<void>(`/orders/${id}`, { method: 'DELETE' });

//   // Upload
//   uploadImages = async (formData: FormData) => {
//     const response = await fetch(`${API_BASE_URL}/upload/images`, {
//       method: 'POST',
//       body: formData
//     });
//     if (!response.ok) throw new Error('Upload failed');
//     return response.json();
//   };
// }

// const api = new SimpleApiClient();

// // =============================================================================
// // QUERY HOOKS - Simple and Clean
// // =============================================================================

// // Categories
// export const useCategories = (options?: UseQueryOptions<Category[]>) =>
//   useQuery({
//     queryKey: KEYS.categories,
//     queryFn: api.getCategories,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     ...options,
//   });

// export const useCategory = (id: string, options?: UseQueryOptions<Category>) =>
//   useQuery({
//     queryKey: KEYS.category(id),
//     queryFn: () => api.getCategory(id),
//     enabled: !!id,
//     ...options,
//   });

// // Products
// export const useProducts = (
//   filters?: { categoryId?: string; search?: string },
//   options?: UseQueryOptions<Product<true>[]>
// ) =>
//   useQuery({
//     queryKey: [...KEYS.products, filters],
//     queryFn: () => api.getProducts(filters),
//     staleTime: 2 * 60 * 1000, // 2 minutes
//     ...options,
//   });

// export const useProduct = (id: string, options?: UseQueryOptions<Product>) =>
//   useQuery({
//     queryKey: KEYS.product(id),
//     queryFn: () => api.getProduct(id),
//     enabled: !!id,
//     ...options,
//   });

// // Orders
// export const useOrders = (options?: UseQueryOptions<Order<true>[]>) =>
//   useQuery({
//     queryKey: KEYS.orders,
//     queryFn: api.getOrders,
//     staleTime: 1 * 60 * 1000, // 1 minute
//     ...options,
//   });

// export const useOrder = (id: string, options?: UseQueryOptions<Order<true>>) =>
//   useQuery({
//     queryKey: KEYS.order(id),
//     queryFn: () => api.getOrder(id),
//     enabled: !!id,
//     ...options,
//   });

// // =============================================================================
// // MUTATION HOOKS - Simple with Auto Cache Updates
// // =============================================================================

// // Generic mutation hook for reusability
// const useMutationWithCache = <TData, TVariables>(
//   mutationFn: (variables: TVariables) => Promise<TData>,
//   options?: {
//     invalidateKeys?: (string | string[])[];
//     onSuccess?: (data: TData, variables: TVariables) => void;
//     onError?: (error: Error, variables: TVariables) => void;
//   }
// ) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn,
//     onSuccess: (data, variables) => {
//       options?.invalidateKeys?.forEach(key => {
//         queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
//       });
//       options?.onSuccess?.(data, variables);
//     },
//     onError: options?.onError,
//   });
// };

// // Categories
// export const useCreateCategory = (options?: UseMutationOptions<Category, Error, Omit<Category, 'id'>>) =>
//   useMutationWithCache(api.createCategory, {
//     invalidateKeys: [KEYS.categories],
//     ...options,
//   });

// export const useUpdateCategory = (options?: UseMutationOptions<Category, Error, { id: string, data: Partial<Category> }>) =>
//   useMutationWithCache(
//     ({ id, data }: { id: string; data: Partial<Category> }) => api.updateCategory(id, data),
//     {
//       invalidateKeys: [KEYS.categories],
//       ...options,
//     }
//   );

// export const useDeleteCategory = (options?: UseMutationOptions<void, Error, string>) =>
//   useMutationWithCache(api.deleteCategory, {
//     invalidateKeys: [KEYS.categories],
//     ...options,
//   });

// // Products
// export const useCreateProduct = (options?: UseMutationOptions<Product, Error, Omit<Product, 'id'>>) =>
//   useMutationWithCache(api.createProduct, {
//     invalidateKeys: [KEYS.products],
//     ...options,
//   });

// export const useUpdateProduct = (options?: UseMutationOptions<Product, Error, { id: string, data: Partial<Product> }>) =>
//   useMutationWithCache(
//     ({ id, data }: { id: string; data: Partial<Product> }) => api.updateProduct(id, data),
//     {
//       invalidateKeys: [KEYS.products],
//       ...options,
//     }
//   );

// export const useDeleteProduct = (options?: UseMutationOptions<void, Error, string>) =>
//   useMutationWithCache(api.deleteProduct, {
//     invalidateKeys: [KEYS.products],
//     ...options,
//   });

// // Orders
// export const useCreateOrder = (options?: UseMutationOptions<Order<true>, Error, Omit<Order<false>, 'id' | 'createdAt'>>) =>
//   useMutationWithCache(api.createOrder, {
//     invalidateKeys: [KEYS.orders],
//     ...options,
//   });

// export const useUpdateOrder = (options?: UseMutationOptions<Order<true>, Error, { id: string, data: Partial<Order<false>> }>) =>
//   useMutationWithCache(
//     ({ id, data }: { id: string; data: Partial<Order<false>> }) => api.updateOrder(id, data),
//     {
//       invalidateKeys: [KEYS.orders],
//       ...options,
//     }
//   );

// export const useDeleteOrder = (options?: UseMutationOptions<void, Error, string>) =>
//   useMutationWithCache(api.deleteOrder, {
//     invalidateKeys: [KEYS.orders],
//     ...options,
//   });

// // Upload
// export const useUploadImages = (options?: UseMutationOptions<any, Error, FormData>) =>
//   useMutation({
//     mutationFn: api.uploadImages,
//     ...options,
//   });

// // =============================================================================
// // UTILITY HOOKS - Super Simple
// // =============================================================================

// // One-liner for refetching any data
// export const useRefetch = () => {
//   const queryClient = useQueryClient();
//   return {
//     categories: () => queryClient.invalidateQueries({ queryKey: KEYS.categories }),
//     products: () => queryClient.invalidateQueries({ queryKey: KEYS.products }),
//     orders: () => queryClient.invalidateQueries({ queryKey: KEYS.orders }),
//     all: () => queryClient.invalidateQueries(),
//   };
// };

// // Export API client for direct use if needed
// export { api };