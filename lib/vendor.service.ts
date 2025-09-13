import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { ApiError, apiClient } from "./api-advance";
import { Vendor, CreateVendorDto, UpdateVendorDto, VendorFilters, PaginatedVendorResponse } from "@/types/vendor.types";

// Extend the existing apiClient with vendor methods
class VendorApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error("Vendor API request failed:", error);
      throw new ApiError("Network error occurred", 0, { originalError: error });
    }
  }

  async getVendors(filters?: VendorFilters): Promise<Vendor[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.city) params.append("city", filters.city);
    if (filters?.state) params.append("state", filters.state);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const endpoint = `/vendors${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await this.request<{ data: Vendor[] }>(endpoint);
    return response.data;
  }

  async getVendorsPaginated(filters?: VendorFilters): Promise<PaginatedVendorResponse> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.city) params.append("city", filters.city);
    if (filters?.state) params.append("state", filters.state);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const endpoint = `/vendors/paginated${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await this.request<{ data: PaginatedVendorResponse }>(endpoint);
    return response.data;
  }

  async getVendorById(id: string): Promise<Vendor> {
    const response = await this.request<{ data: Vendor }>(`/vendors/${id}`);
    return response.data;
  }

  async createVendor(data: CreateVendorDto): Promise<Vendor> {
    const response = await this.request<{ data: Vendor }>("/vendors", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateVendor(id: string, data: UpdateVendorDto): Promise<Vendor> {
    const response = await this.request<{ data: Vendor }>(`/vendors/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteVendor(id: string): Promise<void> {
    await this.request<void>(`/vendors/${id}`, {
      method: "DELETE",
    });
  }
}

export const vendorApiClient = new VendorApiClient();

// Query Keys
export const vendorQueryKeys = {
  all: ["vendors"] as const,
  lists: () => [...vendorQueryKeys.all, "list"] as const,
  list: (filters?: VendorFilters) => [...vendorQueryKeys.lists(), filters] as const,
  details: () => [...vendorQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...vendorQueryKeys.details(), id] as const,
};

// Query Hooks
export const useVendors = <TData = Vendor[]>(
  filters?: VendorFilters,
  options?: Omit<
    UseQueryOptions<Vendor[], ApiError, TData>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: vendorQueryKeys.list(filters),
    queryFn: () => vendorApiClient.getVendors(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useVendorsPaginated = <TData = PaginatedVendorResponse>(
  filters?: VendorFilters,
  options?: Omit<
    UseQueryOptions<PaginatedVendorResponse, ApiError, TData>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: vendorQueryKeys.list({ ...filters, paginated: true } as any),
    queryFn: () => vendorApiClient.getVendorsPaginated(filters),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

export const useVendor = <TData = Vendor>(
  id: string | undefined,
  options?: Omit<
    UseQueryOptions<Vendor, ApiError, TData>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: vendorQueryKeys.detail(id || ""),
    queryFn: () => vendorApiClient.getVendorById(id || ""),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Mutation Hooks
export const useCreateVendor = (
  options?: UseMutationOptions<Vendor, ApiError, CreateVendorDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendorData: CreateVendorDto) =>
      vendorApiClient.createVendor(vendorData),
    onSuccess: (newVendor) => {
      // Invalidate vendors lists
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.lists() });

      // Set the new vendor in cache
      queryClient.setQueryData(
        vendorQueryKeys.detail(newVendor._id || ""),
        newVendor
      );
    },
    onError: (error) => {
      console.error("Failed to create vendor:", error);
    },
    ...options,
  });
};

export const useUpdateVendor = (
  options?: UseMutationOptions<
    Vendor,
    ApiError,
    { id: string; data: UpdateVendorDto }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => vendorApiClient.updateVendor(id, data),
    onSuccess: (updatedVendor, { id }) => {
      // Update the specific vendor in cache
      queryClient.setQueryData(vendorQueryKeys.detail(id), updatedVendor);

      // Invalidate vendors lists to refresh the list view
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.lists() });
    },
    onError: (error) => {
      console.error("Failed to update vendor:", error);
    },
    ...options,
  });
};

export const useDeleteVendor = (
  options?: UseMutationOptions<void, ApiError, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vendorApiClient.deleteVendor(id),
    onSuccess: (_, deletedId) => {
      // Remove the specific vendor query
      queryClient.removeQueries({ queryKey: vendorQueryKeys.detail(deletedId) });

      // Invalidate vendors lists to refresh the list view
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.lists() });
    },
    onError: (error) => {
      console.error("Failed to delete vendor:", error);
    },
    ...options,
  });
};