// Mock data for vendor management
import { Vendor } from "@/types/vendor.types";

export const mockVendors: Vendor[] = [
  {
    _id: "vendor-1",
    name: "ABC Electronics Pvt Ltd",
    contact: ["+91-9876543210", "+91-8765432109"],
    logo: "https://via.placeholder.com/100x100?text=ABC",
    contactPersons: [
      {
        name: "John Doe",
        contacts: ["+91-9876543210", "john@abcelectronics.com"]
      },
      {
        name: "Jane Smith", 
        contacts: ["+91-8765432109", "jane@abcelectronics.com"]
      }
    ],
    address: "123 Industrial Area, Phase 1",
    city: "Mumbai",
    district: "Mumbai",
    state: "Maharashtra", 
    pincode: "400001",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    _id: "vendor-2",
    name: "XYZ Textiles",
    contact: ["+91-7654321098"],
    logo: "https://via.placeholder.com/100x100?text=XYZ",
    contactPersons: [
      {
        name: "Rajesh Kumar",
        contacts: ["+91-7654321098", "rajesh@xyztextiles.com"]
      }
    ],
    address: "456 Textile Market, Sector 5",
    city: "Delhi",
    district: "New Delhi",
    state: "Delhi",
    pincode: "110001",
    createdAt: "2024-01-10T14:20:00Z",
    updatedAt: "2024-01-10T14:20:00Z"
  },
  {
    _id: "vendor-3",
    name: "Tech Solutions Inc",
    contact: ["+91-9988776655", "+91-8877665544"],
    logo: "https://via.placeholder.com/100x100?text=TECH",
    contactPersons: [
      {
        name: "Amit Sharma",
        contacts: ["+91-9988776655", "amit@techsolutions.com"]
      },
      {
        name: "Priya Singh",
        contacts: ["+91-8877665544", "priya@techsolutions.com"]
      }
    ],
    address: "789 Tech Park, Block A",
    city: "Bangalore",
    district: "Bangalore Urban",
    state: "Karnataka",
    pincode: "560001",
    createdAt: "2024-01-20T09:15:00Z",
    updatedAt: "2024-01-20T09:15:00Z"
  }
] as const;