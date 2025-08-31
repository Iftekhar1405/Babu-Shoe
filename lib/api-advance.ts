import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  UseInfiniteQueryOptions,
  useInfiniteQuery,
  QueryClient,
} from "@tanstack/react-query";
import {
  Category,
  Product,
  ApiResponse,
  Order,
  Company,
  Tag,
  ProductDetail,
  CreateOrderFromBillDto,
  OrderResponse,
  OrderFilters,
  PaginatedOrderResponse,
} from "@/types";

interface CreateBillDto {
  productId: string;
  quantity: number;
  color?: string;
  discountPercent: number;
  size: string;
  salesPerson?: string;
}

interface Bill {
  _id: string;
  biller: string;
  items: ProductDetail<true>[];
  totalAmount: number;
  billPrinted: boolean;
  createdAt?: string;
  updatedAt?: string;
}
import { authQueryKeys } from "./auth-hooks";

// const API_BASE_URL = "http://localhost:8080/api";
const API_BASE_URL = "https://babu-shoe-api.vercel.app/api";

export const queryKeys = {
  all: ["api"] as const,

  // Categories
  categories: () => [...queryKeys.all, "categories"] as const,
  category: (id: string) => [...queryKeys.categories(), id] as const,//hellow teri maa kii

  // Products
  products: () => [...queryKeys.all, "products"] as const,
  productsList: (filters?: ProductFilters) =>
    [...queryKeys.products(), "list", filters] as const,
  productsByCategory: (categoryId: string) =>
    [...queryKeys.products(), "category", categoryId] as const,
  product: (id: string) => [...queryKeys.products(), id] as const,
  productSearch: (query: string) =>
    [...queryKeys.products(), "search", query] as const,
  productTags: () => [...queryKeys.products(), "tags"],

  // Orders
  orders: () => [...queryKeys.all, "orders"] as const,
  order: (id: string) => [...queryKeys.orders(), id] as const,
  ordersList: (filters?: OrderFilters) =>
    [...queryKeys.orders(), "list", filters] as const,
  ordersStats: () => [...queryKeys.orders(), "stats"] as const,

  //company
  companies: () => [...queryKeys.all, "companies"] as const,
  company: (id: string) => [...queryKeys.companies(), id] as const,

  // Bills/Cart
  bills: () => [...queryKeys.all, "bills"] as const,
  userBill: (userId?: string) =>
    [...queryKeys.bills(), "user", userId] as const,
  currentCart: () => [...queryKeys.bills(), "current-cart"] as const,
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

class ApiClient {
  private async request<T, Wrapped extends boolean = true>(
    endpoint: string,
    options?: RequestInit
  ): Promise<Wrapped extends true ? ApiResponse<T> : T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        credentials: "include",
        ...options,
      });

      // Handle auth errors globally
      if (response.status === 401) {
        if (typeof window !== "undefined") {
          const queryClient = useQueryClient();
          if (queryClient) {
            queryClient.removeQueries({ queryKey: authQueryKeys.all });
          }
          window.location.href = "/login";
        }
        throw new ApiError("Authentication required", 401);
      }

      if (response.status === 403) {
        throw new ApiError("Access forbidden", 403);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      return (await response.json()) as Wrapped extends true
        ? ApiResponse<T>
        : T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error("API request failed:", error);
      throw new ApiError("Network error occurred", 0, { originalError: error });
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await this.request<Category[]>("/categories");
    return response.data;
  }

  async getCompanies(): Promise<Company[]> {
    const response = await this.request<Company[], false>("/companies");
    return response;
  }

  async getCategoryById(id: string): Promise<Category> {
    const response = await this.request<Category>(`/categories/${id}`);
    return response.data;
  }

  async createCategory(category: Partial<Category>): Promise<Category> {
    const response = await this.request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(category),
    });
    return response.data;
  }

  async createCompany(Company: Partial<Company>): Promise<Company> {
    const response = await this.request<Company>("/companies", {
      method: "POST",
      body: JSON.stringify(Company),
    });
    return response.data;
  }

  async updateCategory(
    id: string,
    category: Partial<Category>
  ): Promise<Category> {
    const response = await this.request<Category>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(category),
    });
    return response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.request<void>(`/categories/${id}`, {
      method: "DELETE",
    });
  }

  // Products
  async getProducts(filters?: ProductFilters): Promise<Product<true>[]> {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append("category", filters.categoryId);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const endpoint = `/products${params.toString() ? `?${params.toString()}` : ""
      }`;
    const response = await this.request<Product<true>[]>(endpoint);
    return response.data;
  }

  async getProductsPaginated(
    filters?: ProductFilters
  ): Promise<PaginatedResponse<Product<true>>> {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append("category", filters.categoryId);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const endpoint = `/products/paginated${params.toString() ? `?${params.toString()}` : ""
      }`;
    const response = await this.request<PaginatedResponse<Product<true>>>(
      endpoint
    );
    return response.data;
  }

  async getProductById(id: string): Promise<Product> {
    const response = await this.request<Product>(`/products/${id}`);
    return response.data;
  }

  async createProduct(product: Partial<Product<false>>): Promise<Product> {
    const response = await this.request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
    return response.data;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const response = await this.request<Product>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(product),
    });
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.request<void>(`/products/${id}`, {
      method: "DELETE",
    });
  }

  async searchProducts(query: string): Promise<Product[]> {
    const response = await this.request<Product[]>(
      `/products?search=${encodeURIComponent(query)}`
    );
    return response.data;
  }

  async uploadImages(formData: FormData): Promise<{ urls: string[] }> {
    const response = await fetch(`${API_BASE_URL}/upload/images`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new ApiError(
        `Upload failed! status: ${response.status}`,
        response.status
      );
    }

    return response.json();
  }

  async uploadImagesLegacy(formData: FormData): Promise<{ urls: string[] }> {
    const response = await fetch(`${API_BASE_URL}/upload/images-legacy`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      throw new ApiError(
        `Upload failed! status: ${response.status}`,
        response.status
      );
    }

    return response.json();
  }

  async createTag(tag: Partial<Tag>): Promise<Tag> {
    const response = await this.request<Tag, false>("/products/tag", {
      method: "POST",
      body: JSON.stringify(tag),
    });
    return response;
  }

  async getTags(): Promise<Tag[]> {
    const response = await this.request<Tag[], false>("/products/tags");
    return response;
  }

  // Orders
  async createOrderFromBill(
    orderData: CreateOrderFromBillDto
  ): Promise<OrderResponse> {
    const response = await this.request<OrderResponse, false>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
    console.log("🪵 ~ ApiClient ~ createOrderFromBill ~ response:", response);
    return response;
  }

  async getOrdersPaginated(
    filters?: OrderFilters
  ): Promise<PaginatedOrderResponse> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.mode) params.append("mode", filters.mode);
    if (filters?.paymentMode) params.append("paymentMode", filters.paymentMode);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const endpoint = `/orders/paginated${params.toString() ? `?${params.toString()}` : ""
      }`;
    const response = await this.request<PaginatedOrderResponse, false>(
      endpoint
    );
    return response;
  }

  async getOrdersStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
  }> {
    const response = await this.request<
      {
        totalOrders: number;
        pendingOrders: number;
        completedOrders: number;
        cancelledOrders: number;
        totalRevenue: number;
      },
      false
    >("/orders/stats");
    return response;
  }

  async updateOrderStatus(
    id: string,
    status: string,
    comment?: string
  ): Promise<Order<true>> {
    const response = await this.request<Order<true>>(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, comment }),
    });
    return response.data;
  }

  async searchOrders(query: string): Promise<Order<true>[]> {
    const response = await this.request<Order<true>[]>(
      `/orders/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  }

  async getOrders(): Promise<Order<true>[]> {
    const response = await this.request<Order<true>[]>("/orders");
    return response.data;
  }

  async getOrderById(id: string): Promise<Order<true>> {
    console.log("🪵 ~ ApiClient ~ getOrderById ~ id:", id);
    const response = await this.request<Order<true>, false>(`/orders/${id}`);
    return response;
  }

  async createOrder(
    order: Omit<Order<false>, "id" | "createdAt">
  ): Promise<Order<true>> {
    const response = await this.request<Order<true>>("/orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
    return response.data;
  }

  async updateOrder(
    id: string,
    orderUpdates: Partial<Order<false>>
  ): Promise<Order<true>> {
    const response = await this.request<Order<true>>(`/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(orderUpdates),
    });
    return response.data;
  }

  async deleteOrder(id: string): Promise<void> {
    await this.request<void>(`/orders/${id}`, {
      method: "DELETE",
    });
  }

  // Bills/Cart API methods
  async addToBill(billData: CreateBillDto): Promise<Bill> {
    const response = await this.request<Bill>("/bill/add", {
      method: "POST",
      body: JSON.stringify(billData),
    });
    return response.data;
  }

  async getCurrentBill(): Promise<Bill | null> {
    try {
      const response = await this.request<Bill, false>("/bill");
      return response || null;
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 404 || error.status === 400)
      ) {
        return null; // Return null when no bill exists
      }
      throw error;
    }
  }

  async clearBill(): Promise<Bill> {
    const response = await this.request<Bill>("/bill/clear-all");
    return response.data;
  }
  async updateBillItem(updateData: {
    productId: string;
    color?: string;
    quantity?: number;
    discountPercent?: number;
  }): Promise<Bill> {
    const response = await this.request<Bill>("/bill/update-item", {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
    return response.data;
  }

  async removeBillItem(removeData: {
    productId: string;
    color?: string;
  }): Promise<Bill> {
    const response = await this.request<Bill>("/bill/remove-item", {
      method: "DELETE",
      body: JSON.stringify(removeData),
    });
    return response.data;
  }
}

// Custom Error Class
export class ApiError extends Error {
  constructor(message: string, public status: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiClient = new ApiClient();

// =============================================================================
// QUERY HOOKS
// =============================================================================

// Categories Queries
export const useCategories = <TData = Category[]>(
  options?: Omit<
    UseQueryOptions<Category[], ApiError, TData>,
    "queryKey" | "queryFn"
  >
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
  options?: Omit<
    UseQueryOptions<Category, ApiError, TData>,
    "queryKey" | "queryFn"
  >
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
  options?: Omit<
    UseQueryOptions<Product<true>[], ApiError, TData>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: queryKeys.productsList(filters),
    queryFn: () => apiClient.getProducts(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useTags = <TData = Tag[]>(
  options?: Omit<
    UseQueryOptions<Tag[], ApiError, TData>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: queryKeys.productTags(),
    queryFn: () => apiClient.getTags(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useInfiniteProducts = (
  filters?: Omit<ProductFilters, "page">,
  options?: Omit<
    UseInfiniteQueryOptions<PaginatedResponse<Product<true>>, ApiError>,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
  >
) => {
  return useInfiniteQuery({
    queryKey: queryKeys.productsList({ ...filters, infinite: true } as any),
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getProductsPaginated({ ...filters, page: pageParam as number }),
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
  options?: Omit<
    UseQueryOptions<Product, ApiError, TData>,
    "queryKey" | "queryFn"
  >
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
  options?: Omit<
    UseQueryOptions<Product[], ApiError, TData>,
    "queryKey" | "queryFn"
  >
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
  options?: Omit<
    UseQueryOptions<Order<true>[], ApiError, TData>,
    "queryKey" | "queryFn"
  >
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
  id: string | undefined,
  options?: Omit<
    UseQueryOptions<Order<true>, ApiError, TData>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: queryKeys.order(id || ""),
    queryFn: () => apiClient.getOrderById(id || ""),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds for orders
    gcTime: 2 * 60 * 1000,
    ...options,
  });
};

export const useOrdersPaginated = <TData = PaginatedOrderResponse>(
  filters?: OrderFilters,
  options?: Omit<
    UseQueryOptions<PaginatedOrderResponse, ApiError, TData>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: queryKeys.ordersList(filters),
    queryFn: () => apiClient.getOrdersPaginated(filters),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

export const useOrdersStats = <
  TData = {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
  }
>(
  options?: Omit<
    UseQueryOptions<
      {
        totalOrders: number;
        pendingOrders: number;
        completedOrders: number;
        cancelledOrders: number;
        totalRevenue: number;
      },
      ApiError,
      TData
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: queryKeys.ordersStats(),
    queryFn: () => apiClient.getOrdersStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Bill/Cart
export const useCurrentBill = <TData = Bill | null>(
  options?: Omit<
    UseQueryOptions<Bill | null, ApiError, TData>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: queryKeys.currentCart(),
    queryFn: () => apiClient.getCurrentBill(),
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 1,
    ...options,
  });
};

// =============================================================================
// MUTATION HOOKS
// =============================================================================

// Category Mutations
export const useCreateCategory = (
  options?: UseMutationOptions<Category, ApiError, Partial<Category>>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData: Partial<Category>) =>
      apiClient.createCategory(categoryData),
    onSuccess: (newCategory) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });

      // Optionally add the new category to the cache
      queryClient.setQueryData(
        queryKeys.category(newCategory._id || ""),
        newCategory
      );
    },
    onError: (error) => {
      console.error("Failed to create category:", error);
    },
    ...options,
  });
};

export const useUpdateCategory = (
  options?: UseMutationOptions<
    Category,
    ApiError,
    { id: string; data: Partial<Category> }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => apiClient.updateCategory(id, data),
    onSuccess: (updatedCategory, { id }) => {
      // Update the specific category in cache
      queryClient.setQueryData(queryKeys.category(id), updatedCategory);

      // Update the category in the categories list
      queryClient.setQueryData<Category[]>(queryKeys.categories(), (old) =>
        old?.map((cat) => (cat._id === id ? updatedCategory : cat))
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
      queryClient.setQueryData<Category[]>(queryKeys.categories(), (old) =>
        old?.filter((cat) => cat._id !== deletedId)
      );

      // Remove the specific category query
      queryClient.removeQueries({ queryKey: queryKeys.category(deletedId) });
    },
    ...options,
  });
};

// Product Mutations
export const useCreateProduct = (
  options?: UseMutationOptions<Product, ApiError, Partial<Product<false>>>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: Partial<Product<false>>) =>
      apiClient.createProduct(productData),
    onSuccess: (newProduct) => {
      // Invalidate products lists
      queryClient.invalidateQueries({ queryKey: queryKeys.products() });

      // Set the new product in cache
      queryClient.setQueryData(
        queryKeys.product(newProduct._id || ""),
        newProduct
      );
    },
    ...options,
  });
};

export const useUpdateProduct = (
  options?: UseMutationOptions<
    Product,
    ApiError,
    { id: string; data: Partial<Product> }
  >
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

export const useCreateTag = (
  options?: UseMutationOptions<Tag, ApiError, Partial<Tag>>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tag: Partial<Tag>) => apiClient.createTag(tag),
    onSuccess: (tag) => {
      // Invalidate products lists
      queryClient.invalidateQueries({ queryKey: queryKeys.productTags() });

      // Set the new product in cache
      queryClient.setQueryData(queryKeys.product(tag._id || ""), tag);
    },
    ...options,
  });
};

// Order Mutations
export const useCreateOrderFromBill = (
  options?: UseMutationOptions<OrderResponse, ApiError, CreateOrderFromBillDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: CreateOrderFromBillDto) =>
      apiClient.createOrderFromBill(orderData),
    onSuccess: (newOrder) => {
      console.log("🪵 ~ useCreateOrderFromBill ~ newOrder:", newOrder);
      // Invalidate orders list to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.orders() });

      // Set the new order in cache
      queryClient.setQueryData(queryKeys.order(newOrder._id), newOrder);

      // Clear the current bill after successful order creation
      queryClient.setQueryData(queryKeys.currentCart(), null);
      queryClient.invalidateQueries({ queryKey: queryKeys.currentCart() });
    },
    onError: (error) => {
      console.error("Failed to create order:", error);
    },
    ...options,
  });
};

export const useUpdateOrderStatus = (
  options?: UseMutationOptions<
    Order<true>,
    ApiError,
    { id: string; status: string; comment?: string }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, comment }) =>
      apiClient.updateOrderStatus(id, status, comment),
    onSuccess: (updatedOrder, { id }) => {
      queryClient.setQueryData(queryKeys.order(id), updatedOrder);

      queryClient.setQueryData<Order<true>[]>(queryKeys.orders(), (old) =>
        old?.map((order) => (order._id === id ? updatedOrder : order))
      );

      queryClient.setQueriesData<PaginatedOrderResponse>(
        { queryKey: queryKeys.ordersList() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((order) =>
              order._id === id ? updatedOrder : order
            ),
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: queryKeys.ordersStats() });
    },
    onError: (error) => {
      console.error("Failed to update order status:", error);
    },
    ...options,
  });
};

export const useCreateOrder = (
  options?: UseMutationOptions<
    Order<true>,
    ApiError,
    Omit<Order<false>, "id" | "createdAt">
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: Omit<Order<false>, "id" | "createdAt">) =>
      apiClient.createOrder(orderData),
    onSuccess: (newOrder) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: queryKeys.orders() });

      // Set the new order in cache
      queryClient.setQueryData(queryKeys.order(newOrder._id || ""), newOrder);
    },
    ...options,
  });
};

export const useUpdateOrder = (
  options?: UseMutationOptions<
    Order<true>,
    ApiError,
    { id: string; data: Partial<Order<false>> }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => apiClient.updateOrder(id, data),
    onSuccess: (updatedOrder, { id }) => {
      // Update the specific order
      queryClient.setQueryData(queryKeys.order(id), updatedOrder);

      // Update in orders list
      queryClient.setQueryData<Order<true>[]>(queryKeys.orders(), (old) =>
        old?.map((order) => (order._id === id ? updatedOrder : order))
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
      queryClient.setQueryData<Order<true>[]>(queryKeys.orders(), (old) =>
        old?.filter((order) => order._id !== deletedId)
      );

      // Remove the specific order query
      queryClient.removeQueries({ queryKey: queryKeys.order(deletedId) });
    },
    ...options,
  });
};

export const useAddToBill = (
  options?: UseMutationOptions<Bill, ApiError, CreateBillDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (billData: CreateBillDto) => apiClient.addToBill(billData),
    onSuccess: (updatedBill) => {
      // Update the current cart cache
      queryClient.setQueryData(queryKeys.currentCart(), updatedBill);

      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.currentCart() });
    },
    onError: (error) => {
      console.error("Failed to add to bill:", error);
    },
    ...options,
  });
};

export const useUpdateBillItemMutation = (
  options?: UseMutationOptions<
    Bill,
    ApiError,
    {
      productId: string;
      color?: string;
      quantity?: number;
      discountPercent?: number;
    }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updateData) => apiClient.updateBillItem(updateData),
    onSuccess: (updatedBill) => {
      queryClient.setQueryData(queryKeys.currentCart(), updatedBill);
      queryClient.invalidateQueries({ queryKey: queryKeys.currentCart() });
    },
    onError: (error) => {
      console.error("Failed to update bill item:", error);
    },
    ...options,
  });
};

export const useRemoveBillItemMutation = (
  options?: UseMutationOptions<
    Bill,
    ApiError,
    { productId: string; color?: string }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (removeData) => apiClient.removeBillItem(removeData),
    onSuccess: (updatedBill) => {
      queryClient.setQueryData(queryKeys.currentCart(), updatedBill);
      queryClient.invalidateQueries({ queryKey: queryKeys.currentCart() });
    },
    onError: (error) => {
      console.error("Failed to remove bill item:", error);
    },
    ...options,
  });
};

export const useClearBill = (
  options?: UseMutationOptions<Bill, ApiError, void>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.clearBill(),
    onSuccess: (clearedBill) => {
      queryClient.setQueryData(queryKeys.currentCart(), clearedBill);
      queryClient.invalidateQueries({ queryKey: queryKeys.currentCart() });
    },
    onError: (error) => {
      console.error("Failed to clear bill:", error);
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
      queryClient.setQueryData<Category>(queryKeys.category(id), (old) =>
        old ? { ...old, ...updates } : undefined
      );
    },
    updateProduct: (id: string, updates: Partial<Product>) => {
      queryClient.setQueryData<Product>(queryKeys.product(id), (old) =>
        old ? { ...old, ...updates } : undefined
      );
    },
    updateOrder: (id: string, updates: Partial<Order<true>>) => {
      queryClient.setQueryData<Order<true>>(queryKeys.order(id), (old) =>
        old ? { ...old, ...updates } : undefined
      );
    },
  };
};

// Optimistically update bigintll
export const useOptimisticBillUpdates = () => {
  const queryClient = useQueryClient();

  return {
    addItemOptimistically: (item: ProductDetail<true>) => {
      queryClient.setQueryData<Bill>(queryKeys.currentCart(), (old) => {
        if (!old) return old;

        const existingItemIndex = old.items.findIndex(
          (existingItem) =>
            existingItem.productId._id === item.productId._id &&
            existingItem.color === item.color
        );

        let newItems;
        if (existingItemIndex > -1) {
          // Update existing item
          newItems = [...old.items];
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + item.quantity,
            finalPrice:
              newItems[existingItemIndex].finalPrice + item.finalPrice,
          };
        } else {
          // Add new item
          newItems = [...old.items, item];
        }

        const totalAmount = newItems.reduce(
          (sum, item) => sum + item.finalPrice,
          0
        );

        return {
          ...old,
          items: newItems,
          totalAmount,
        };
      });
    },

    removeItemOptimistically: (productId: string, color: string) => {
      queryClient.setQueryData<Bill>(queryKeys.currentCart(), (old) => {
        if (!old) return old;

        const newItems = old.items.filter(
          (item) => !(item.productId._id === productId && item.color === color)
        );

        const totalAmount = newItems.reduce(
          (sum, item) => sum + item.finalPrice,
          0
        );

        return {
          ...old,
          items: newItems,
          totalAmount,
        };
      });
    },

    updateItemOptimistically: (
      productId: string,
      color: string,
      updates: Partial<ProductDetail<true>>
    ) => {
      queryClient.setQueryData<Bill>(queryKeys.currentCart(), (old) => {
        if (!old) return old;

        const newItems = old.items.map((item) => {
          if (item.productId._id === productId && item.color === color) {
            return { ...item, ...updates };
          }
          return item;
        });

        const totalAmount = newItems.reduce(
          (sum, item) => sum + item.finalPrice,
          0
        );

        return {
          ...old,
          items: newItems,
          totalAmount,
        };
      });
    },

    clearBillOptimistically: () => {
      queryClient.setQueryData<Bill>(queryKeys.currentCart(), (old) => {
        if (!old) return old;

        return {
          ...old,
          items: [],
          totalAmount: 0,
        };
      });
    },
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 403) {
          queryClient.removeQueries({ queryKey: authQueryKeys.all });
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

// Add global error handler for auth errors
queryClient.getQueryCache().config.onError = (error: any) => {
  if (error?.status === 401) {
    queryClient.removeQueries({ queryKey: authQueryKeys.all });
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
};
