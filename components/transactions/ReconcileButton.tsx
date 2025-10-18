'use client';

import React from 'react';
import { useReconcileCustomerBalance } from '@/lib/api-advance';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface ReconcileButtonProps {
    customerId: string;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ReconcileButton({
    customerId,
    variant = 'outline',
    size = 'default'
}: ReconcileButtonProps) {
    const reconcile = useReconcileCustomerBalance();

    const handleReconcile = async () => {
        try {
            const result = await reconcile.mutateAsync(customerId);
            toast.success(result.message || 'Customer balance reconciled successfully');
        } catch (error) {
            toast.error('Failed to reconcile customer balance');
            console.error('Reconcile error:', error);
        }
    };

    return (
        <Button
            onClick={handleReconcile}
            disabled={reconcile.isPending}
            variant={variant}
            size={size}
            className="gap-2"
        >
            <RotateCcw className={`h-4 w-4 ${reconcile.isPending ? 'animate-spin' : ''}`} />
            {reconcile.isPending ? 'Reconciling...' : 'Reconcile'}
        </Button>
    );
}
