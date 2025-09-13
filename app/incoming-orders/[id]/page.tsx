'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import IncomingOrderDetails from '@/components/incoming-orders/IncomingOrderDetails';

export default function OrderIdPage() {
    const params = useParams();
    const id = params?.id as string;
    if (!id) return <div>Missing order id</div>;
    return (
        <div className="p-6">
            <IncomingOrderDetails id={id} />
        </div>
    );
}