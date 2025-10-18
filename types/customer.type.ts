export interface Customer {
    _id: string;
    name: string;
    contact?: string;
    phone?: string;
    email?: string;
    currentBalance?: number;
    creditLimit?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCustomerDto {
    name: string;
    contact?: string;
    phone?: string;
    email?: string;
    creditLimit?: number;
}

export interface UpdateCustomerDto {
    name?: string;
    contact?: string;
    phone?: string;
    email?: string;
    currentBalance?: number;
    creditLimit?: number;
}

export interface CustomerFilters {
    page?: number;
    limit?: number;
    search?: string;
}

export interface PaginatedCustomerResponse {
    data: Customer[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}