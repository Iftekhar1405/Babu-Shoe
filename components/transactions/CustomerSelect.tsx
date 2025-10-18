'use client';

import React from 'react';
import { useCustomers } from '@/lib/api-advance';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer } from '@/types';

interface CustomerSelectProps {
    value?: Customer | null;
    onChange: (customer: Customer | null) => void;
    placeholder?: string;
}

export function CustomerSelect({ value, onChange, placeholder = "Select customer" }: CustomerSelectProps) {
    const { data: customersResponse, isLoading } = useCustomers({ limit: 100 });
    const customers = customersResponse?.data || [];

    return (
        <Select
            value={value?._id || ""}
            onValueChange={(customerId) => {
                const selectedCustomer = customers.find((c) => c._id === customerId);
                onChange(selectedCustomer || null);
            }}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoading ? 'Loading customers...' : placeholder} />
            </SelectTrigger>
            <SelectContent>
                {customers.map((customer) => (
                    <SelectItem key={customer._id} value={customer._id}>
                        {customer.name} — {customer.phone || customer.contact || '—'}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
