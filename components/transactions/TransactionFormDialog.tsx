'use client';

import React, { useState } from 'react';
import { useCreateTransaction, makeIdempotencyKey } from '@/lib/api-advance';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TransactionType, Customer } from '@/types';
import { toast } from 'sonner';

interface TransactionFormDialogProps {
    customer: Customer;
    trigger?: React.ReactNode;
}

export function TransactionFormDialog({ customer, trigger }: TransactionFormDialogProps) {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<TransactionType>(TransactionType.PAYMENT);
    const [amount, setAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
    const [remarks, setRemarks] = useState<string>('');

    const createTransaction = useCreateTransaction();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            const idempotencyKey = makeIdempotencyKey();
            await createTransaction.mutateAsync({
                customerId: customer._id,
                type,
                amount: parseFloat(amount),
                paymentMethod,
                remarks: remarks || undefined,
                idempotencyKey,
            });

            toast.success('Transaction created successfully');
            setOpen(false);
            resetForm();
        } catch (error) {
            toast.error('Failed to create transaction');
            console.error('Transaction creation error:', error);
        }
    };

    const resetForm = () => {
        setType(TransactionType.PAYMENT);
        setAmount('');
        setPaymentMethod('Cash');
        setRemarks('');
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            resetForm();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="default" size="sm">
                        New Transaction
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create Transaction for {customer?.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Transaction Type</Label>
                        <Select value={type} onValueChange={(value) => setType(value as TransactionType)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select transaction type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={TransactionType.PAYMENT}>Payment</SelectItem>
                                <SelectItem value={TransactionType.CHARGE}>Charge</SelectItem>
                                <SelectItem value={TransactionType.REFUND}>Refund</SelectItem>
                                <SelectItem value={TransactionType.ADJUSTMENT}>Adjustment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="UPI">UPI</SelectItem>
                                <SelectItem value="Card">Card</SelectItem>
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                <SelectItem value="Credit">Credit</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="remarks">Remarks (Optional)</Label>
                        <Textarea
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Enter any additional notes..."
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createTransaction.isPending}
                        >
                            {createTransaction.isPending ? 'Creating...' : 'Create Transaction'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
