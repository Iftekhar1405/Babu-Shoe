import { Category, Company } from "@/types";
import { useMutation, UseMutationOptions, useQuery, UseQueryOptions, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError, queryKeys } from "./api-advance";

export const useCreateCompany = (
    options?: UseMutationOptions<Company, ApiError, Partial<Company>>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (companyData: Partial<Company>) =>
            apiClient.createCompany(companyData),
        onSuccess: (newCompany) => {
            // Invalidate and refetch categories list
            queryClient.invalidateQueries({ queryKey: queryKeys.companies() });

            // Optionally add the new category to the cache
            queryClient.setQueryData(queryKeys.company(newCompany._id || ''), newCompany);
        },
        onError: (error) => {
            console.error('Failed to create category:', error);
        },
        ...options,
    });
};

export const useCompanies = <TData = Company[]>(
    options?: Omit<UseQueryOptions<Company[], ApiError, TData>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: queryKeys.companies(),
        queryFn: () => apiClient.getCompanies(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        ...options,
    });
};
