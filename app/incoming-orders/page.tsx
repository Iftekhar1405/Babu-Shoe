'use client';
import IncomingOrdersList from '@/components/incoming-orders/IncomingOrdersList';
import React from 'react';

export default function OrdersPage() {
    return (
        <div className="p-6">
            <IncomingOrdersList />
        </div>
    );
}