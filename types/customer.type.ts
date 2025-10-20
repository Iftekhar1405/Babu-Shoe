export interface Customer {
    _id: string;
    userId: {
        _id: string;
        name: string;
        phoneNumber: string;
        role: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        password?: string;
        __v?: number;
    };
    contact: string;
    creditLimit: number;
    creditBalance: number;
    currentBalance: number;
    address: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    __v?: number;
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