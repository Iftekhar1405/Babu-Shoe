// Vendor management type definitions
export interface ContactPerson {
  name: string;
  contacts: string[];
}

export interface Vendor {
  _id?: string;
  name: string;
  contact: string[];
  logo: string;
  contactPersons: ContactPerson[];
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVendorDto {
  name: string;
  contact: string[];
  logo: string;
  contactPersons: ContactPerson[];
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export interface UpdateVendorDto extends Partial<CreateVendorDto> {}

export interface VendorFilters {
  search?: string;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedVendorResponse {
  data: Vendor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}