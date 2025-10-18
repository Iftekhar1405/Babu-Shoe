'use client';

import React, { useState } from 'react';
import { useReverseTransaction, makeIdempotencyKey } from '@/lib/api-advance';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Transaction } from '@/types';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface ReverseDialogProps {
    transaction: Transaction;
    trigger?: React.ReactNode;
}

export function ReverseDialog({ transaction, trigger }: ReverseDialogProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');

    const reverseTransaction = useReverseTransaction();

    const handleReverse = async () => {
        if (!reason.trim()) {
            toast.error('Please provide a reason for reversal');
            return;
        }

        try {
            const idempotencyKey = makeIdempotencyKey();
            await reverseTransaction.mutateAsync({
                transactionId: transaction._id,
                reason,
                idempotencyKey,
            });

            toast.success('Transaction reversed successfully');
            setOpen(false);
            setReason('');
        } catch (error) {
            toast.error('Failed to reverse transaction');
            console.error('Transaction reversal error:', error);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setReason('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" variant="destructive">
                        Reverse
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Reverse Transaction
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium">Transaction Details:</p>
                        <div className="mt-2 space-y-1 text-sm">
                            <p><span className="font-medium">ID:</span> {transaction._id}</p>
                            <p><span className="font-medium">Type:</span> {transaction.type}</p>
                            <p><span className="font-medium">Amount:</span> ₹{transaction.amount.toFixed(2)}</p>
                            <p><span className="font-medium">Date:</span> {new Date(transaction.createdAt).toLocaleString()}</p>
                            {transaction.paymentMethod && (
                                <p><span className="font-medium">Payment Method:</span> {transaction.paymentMethod}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Reversal *</Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Explain why this transaction needs to be reversed..."
                            rows={3}
                            required
                        />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            <strong>Warning:</strong> This action cannot be undone. The transaction will be marked as reversed and a new reversal transaction will be created.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleReverse}
                        disabled={reverseTransaction.isPending || !reason.trim()}
                    >
                        {reverseTransaction.isPending ? 'Reversing...' : 'Confirm Reverse'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
