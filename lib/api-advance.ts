import {
    useQuery,
    useMutation,
    useQueryClient,
    UseQueryOptions,
    UseMutationOptions,
    UseInfiniteQueryOptions,
    useInfiniteQuery
} from '@tanstack/react-query';
import { Category, Product, ApiResponse, Order } from '@/types';

const API_BASE_URL = 'http://localhost:8080/api';

// Query Keys Factory - Industry standard approach for managing query keys
export const queryKeys = {
    all: ['api'] as const,

    // Categories
    categories: () => [...queryKeys.all, 'categories'] as const,
    category: (id: string) => [...queryKeys.categories(), id] as const,

    // Products
    products: () => [...queryKeys.all, 'products'] as const,
    productsList: (filters?: ProductFilters) => [...queryKeys.products(), 'list', filters] as const,
    productsByCategory: (categoryId: string) => [...queryKeys.products(), 'category', categoryId] as const,
    product: (id: string) => [...queryKeys.products(), id] as const,
    productSearch: (query: string) => [...queryKeys.products(), 'search', query] as const,

    // Orders
    orders: () => [...queryKeys.all, 'orders'] as const,
    order: (id: string) => [...queryKeys.orders(), id] as const,
} as const;

// Types for better type safety
interface ProductFilters {
    categoryId?: string;
    search?: string;
    page?: number;
    limit?: number;
}

interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Enhanced API Client with better error handling and types
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
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(
                    `HTTP error! status: ${response.status}`,
                    response.status,
                    errorData
                );
            }

            return await response.json();
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError('Network error occurred', 0, { originalError: error });
        }
    }

    // Categories
    async getCategories(): Promise<Category[]> {
        const response = await this.request<Category[]>('/categories');
        return response.data;
    }

    async getCategoryById(id: string): Promise<Category> {
        const response = await this.request<Category>(`/categories/${id}`);
        return response.data;
    }

    async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
        const response = await this.request<Category>('/categories', {
            method: 'POST',
            body: JSON.stringify(category),
        });
        return response.data;
    }

    async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
        const response = await this.request<Category>(`/categories/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(category),
        });
        return response.data;
    }

    async deleteCategory(id: string): Promise<void> {
        await this.request<void>(`/categories/${id}`, {
            method: 'DELETE',
        });
    }

    // Products
    async getProducts(filters?: ProductFilters): Promise<Product<true>[]> {
        const params = new URLSearchParams();
        if (filters?.categoryId) params.append('category', filters.categoryId);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const endpoint = `/products${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await this.request<Product<true>[]>(endpoint);
        return response.data;
    }

    async getProductsPaginated(filters?: ProductFilters): Promise<PaginatedResponse<Product<true>>> {
        const params = new URLSearchParams();
        if (filters?.categoryId) params.append('category', filters.categoryId);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const endpoint = `/products/paginated${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await this.request<PaginatedResponse<Product<true>>>(endpoint);
        return response.data;
    }

    async getProductById(id: string): Promise<Product> {
        const response = await this.request<Product>(`/products/${id}`);
        return response.data;
    }

    async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
        const response = await this.request<Product>('/products', {
            method: 'POST',
            body: JSON.stringify(product),
        });
        return response.data;
    }

    async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
        const response = await this.request<Product>(`/products/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(product),
        });
        return response.data;
    }

    async deleteProduct(id: string): Promise<void> {
        await this.request<void>(`/products/${id}`, {
            method: 'DELETE',
        });
    }

    async searchProducts(query: string): Promise<Product[]> {
        const response = await this.request<Product[]>(`/products?search=${encodeURIComponent(query)}`);
        return response.data;
    }

    async uploadImages(formData: FormData): Promise<{ urls: string[] }> {
        const response = await fetch(`${API_BASE_URL}/upload/images`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new ApiError(`Upload failed! status: ${response.status}`, response.status);
        }

        return response.json();
    }

    async uploadImagesLegacy(formData: FormData): Promise<{ urls: string[] }> {
        const response = await fetch(`${API_BASE_URL}/upload/images-legacy`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new ApiError(`Upload failed! status: ${response.status}`, response.status);
        }

        return response.json();
    }

    // Orders
    async getOrders(): Promise<Order<true>[]> {
        const response = await this.request<Order<true>[]>('/orders');
        return response.data;
    }

    async getOrderById(id: string): Promise<Order<true>> {
        const response = await this.request<Order<true>>(`/orders/${id}`);
        return response.data;
    }

    async createOrder(order: Omit<Order<false>, 'id' | 'createdAt'>): Promise<Order<true>> {
        const response = await this.request<Order<true>>('/orders', {
            method: 'POST',
            body: JSON.stringify(order),
        });
        return response.data;
    }

    async updateOrder(id: string, orderUpdates: Partial<Order<false>>): Promise<Order<true>> {
        const response = await this.request<Order<true>>(`/orders/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(orderUpdates),
        });
        return response.data;
    }

    async deleteOrder(id: string): Promise<void> {
        await this.request<void>(`/orders/${id}`, {
            method: 'DELETE',
        });
    }
}

// Custom Error Class
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export const apiClient = new ApiClient();

// =============================================================================
// QUERY HOOKS
// =============================================================================

// Categories Queries
export const useCategories = <TData = Category[]>(
    options?: Omit<UseQueryOptions<Category[], ApiError, TData>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: queryKeys.categories(),
        queryFn: () => apiClient.getCategories(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        ...options,
    });
};

export const useCategory = <TData = Category>(
    id: string,
    options?: Omit<UseQueryOptions<Category, ApiError, TData>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: queryKeys.category(id),
        queryFn: () => apiClient.getCategoryById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        ...options,
    });
};

// Products Queries
export const useProducts = <TData = Product<true>[]>(
    filters?: ProductFilters,
    options?: Omit<UseQueryOptions<Product<true>[], ApiError, TData>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: queryKeys.productsList(filters),
        queryFn: () => apiClient.getProducts(filters),
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000,
        ...options,
    });
};

export const useInfiniteProducts = (
    filters?: Omit<ProductFilters, 'page'>,
    options?: Omit<UseInfiniteQueryOptions<PaginatedResponse<Product<true>>, ApiError>, 'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'>
) => {
    return useInfiniteQuery({
        queryKey: queryKeys.productsList({ ...filters, infinite: true } as any),
        queryFn: ({ pageParam = 1 }) =>
            apiClient.getProductsPaginated({ ...filters, page: pageParam }),
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.page < lastPage.pagination.totalPages) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        ...options,
    });
};

export const useProduct = <TData = Product>(
    id: string,
    options?: Omit<UseQueryOptions<Product, ApiError, TData>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: queryKeys.product(id),
        queryFn: () => apiClient.getProductById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        ...options,
    });
};

export const useProductSearch = <TData = Product[]>(
    query: string,
    options?: Omit<UseQueryOptions<Product[], ApiError, TData>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: queryKeys.productSearch(query),
        queryFn: () => apiClient.searchProducts(query),
        enabled: !!query && query.length > 2,
        staleTime: 30 * 1000, // 30 seconds for search results
        gcTime: 2 * 60 * 1000,
        ...options,
    });
};

// Orders Queries
export const useOrders = <TData = Order<true>[]>(
    options?: Omit<UseQueryOptions<Order<true>[], ApiError, TData>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: queryKeys.orders(),
        queryFn: () => apiClient.getOrders(),
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000,
        ...options,
    });
};

export const useOrder = <TData = Order<true>>(
    id: string,
    options?: Omit<UseQueryOptions<Order<true>, ApiError, TData>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: queryKeys.order(id),
        queryFn: () => apiClient.getOrderById(id),
        enabled: !!id,
        staleTime: 30 * 1000, // 30 seconds for orders
        gcTime: 2 * 60 * 1000,
        ...options,
    });
};

// =============================================================================
// MUTATION HOOKS
// =============================================================================

// Category Mutations
export const useCreateCategory = (
    options?: UseMutationOptions<Category, ApiError, Omit<Category, 'id'>>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (categoryData: Omit<Category, 'id'>) =>
            apiClient.createCategory(categoryData),
        onSuccess: (newCategory) => {
            // Invalidate and refetch categories list
            queryClient.invalidateQueries({ queryKey: queryKeys.categories() });

            // Optionally add the new category to the cache
            queryClient.setQueryData(queryKeys.category(newCategory.id), newCategory);
        },
        onError: (error) => {
            console.error('Failed to create category:', error);
        },
        ...options,
    });
};

export const useUpdateCategory = (
    options?: UseMutationOptions<Category, ApiError, { id: string; data: Partial<Category> }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => apiClient.updateCategory(id, data),
        onSuccess: (updatedCategory, { id }) => {
            // Update the specific category in cache
            queryClient.setQueryData(queryKeys.category(id), updatedCategory);

            // Update the category in the categories list
            queryClient.setQueryData<Category[]>(
                queryKeys.categories(),
                (old) => old?.map(cat => cat.id === id ? updatedCategory : cat)
            );
        },
        ...options,
    });
};

export const useDeleteCategory = (
    options?: UseMutationOptions<void, ApiError, string>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => apiClient.deleteCategory(id),
        onSuccess: (_, deletedId) => {
            // Remove from categories list
            queryClient.setQueryData<Category[]>(
                queryKeys.categories(),
                (old) => old?.filter(cat => cat.id !== deletedId)
            );

            // Remove the specific category query
            queryClient.removeQueries({ queryKey: queryKeys.category(deletedId) });
        },
        ...options,
    });
};

// Product Mutations
export const useCreateProduct = (
    options?: UseMutationOptions<Product, ApiError, Omit<Product, 'id'>>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productData: Omit<Product, 'id'>) =>
            apiClient.createProduct(productData),
        onSuccess: (newProduct) => {
            // Invalidate products lists
            queryClient.invalidateQueries({ queryKey: queryKeys.products() });

            // Set the new product in cache
            queryClient.setQueryData(queryKeys.product(newProduct.id), newProduct);
        },
        ...options,
    });
};

export const useUpdateProduct = (
    options?: UseMutationOptions<Product, ApiError, { id: string; data: Partial<Product> }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => apiClient.updateProduct(id, data),
        onSuccess: (updatedProduct, { id }) => {
            // Update the specific product
            queryClient.setQueryData(queryKeys.product(id), updatedProduct);

            // Invalidate products lists to ensure consistency
            queryClient.invalidateQueries({ queryKey: queryKeys.products() });
        },
        ...options,
    });
};

export const useDeleteProduct = (
    options?: UseMutationOptions<void, ApiError, string>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => apiClient.deleteProduct(id),
        onSuccess: (_, deletedId) => {
            // Remove the specific product query
            queryClient.removeQueries({ queryKey: queryKeys.product(deletedId) });

            // Invalidate products lists
            queryClient.invalidateQueries({ queryKey: queryKeys.products() });
        },
        ...options,
    });
};

export const useUploadImages = (
    options?: UseMutationOptions<{ urls: string[] }, ApiError, FormData>
) => {
    return useMutation({
        mutationFn: (formData: FormData) => apiClient.uploadImages(formData),
        ...options,
    });
};

export const useUploadImagesLegacy = (
    options?: UseMutationOptions<{ urls: string[] }, ApiError, FormData>
) => {
    return useMutation({
        mutationFn: (formData: FormData) => apiClient.uploadImagesLegacy(formData),
        ...options,
    });
};

// Order Mutations
export const useCreateOrder = (
    options?: UseMutationOptions<Order<true>, ApiError, Omit<Order<false>, 'id' | 'createdAt'>>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderData: Omit<Order<false>, 'id' | 'createdAt'>) =>
            apiClient.createOrder(orderData),
        onSuccess: (newOrder) => {
            // Invalidate orders list
            queryClient.invalidateQueries({ queryKey: queryKeys.orders() });

            // Set the new order in cache
            queryClient.setQueryData(queryKeys.order(newOrder.id), newOrder);
        },
        ...options,
    });
};

export const useUpdateOrder = (
    options?: UseMutationOptions<Order<true>, ApiError, { id: string; data: Partial<Order<false>> }>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => apiClient.updateOrder(id, data),
        onSuccess: (updatedOrder, { id }) => {
            // Update the specific order
            queryClient.setQueryData(queryKeys.order(id), updatedOrder);

            // Update in orders list
            queryClient.setQueryData<Order<true>[]>(
                queryKeys.orders(),
                (old) => old?.map(order => order.id === id ? updatedOrder : order)
            );
        },
        ...options,
    });
};

export const useDeleteOrder = (
    options?: UseMutationOptions<void, ApiError, string>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => apiClient.deleteOrder(id),
        onSuccess: (_, deletedId) => {
            // Remove from orders list
            queryClient.setQueryData<Order<true>[]>(
                queryKeys.orders(),
                (old) => old?.filter(order => order.id !== deletedId)
            );

            // Remove the specific order query
            queryClient.removeQueries({ queryKey: queryKeys.order(deletedId) });
        },
        ...options,
    });
};

// =============================================================================
// UTILITY HOOKS
// =============================================================================

// Prefetch hooks for better UX
export const usePrefetchCategory = () => {
    const queryClient = useQueryClient();

    return (id: string) => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.category(id),
            queryFn: () => apiClient.getCategoryById(id),
            staleTime: 5 * 60 * 1000,
        });
    };
};

export const usePrefetchProduct = () => {
    const queryClient = useQueryClient();

    return (id: string) => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.product(id),
            queryFn: () => apiClient.getProductById(id),
            staleTime: 5 * 60 * 1000,
        });
    };
};

export const usePrefetchOrder = () => {
    const queryClient = useQueryClient();

    return (id: string) => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.order(id),
            queryFn: () => apiClient.getOrderById(id),
            staleTime: 30 * 1000,
        });
    };
};

// Optimistic update helper
export const useOptimisticUpdate = () => {
    const queryClient = useQueryClient();

    return {
        updateCategory: (id: string, updates: Partial<Category>) => {
            queryClient.setQueryData<Category>(
                queryKeys.category(id),
                (old) => old ? { ...old, ...updates } : undefined
            );
        },
        updateProduct: (id: string, updates: Partial<Product>) => {
            queryClient.setQueryData<Product>(
                queryKeys.product(id),
                (old) => old ? { ...old, ...updates } : undefined
            );
        },
        updateOrder: (id: string, updates: Partial<Order<true>>) => {
            queryClient.setQueryData<Order<true>>(
                queryKeys.order(id),
                (old) => old ? { ...old, ...updates } : undefined
            );
        },
    };
};