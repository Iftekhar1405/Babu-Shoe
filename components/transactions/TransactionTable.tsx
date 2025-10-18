'use client';

import React from 'react';
import { useCustomerLedger } from '@/lib/api-advance';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, TransactionType } from '@/types';
import { ReverseDialog } from './ReverseDialog';
import { Calendar, Clock, CreditCard, MessageSquare } from 'lucide-react';

interface TransactionTableProps {
    customerId: string;
    limit?: number;
}

export function TransactionTable({ customerId, limit = 100 }: TransactionTableProps) {
    const { data: transactions, isLoading, isError } = useCustomerLedger(customerId, limit);

    if (!customerId) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Select a customer to view transaction ledger</p>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading transaction ledger...</p>
                </CardContent>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-destructive">Error loading transaction ledger</p>
                </CardContent>
            </Card>
        );
    }

    if (!transactions || transactions.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No transactions found for this customer</p>
                </CardContent>
            </Card>
        );
    }

    const getTransactionTypeColor = (type: TransactionType) => {
        switch (type) {
            case TransactionType.PAYMENT:
                return 'bg-green-100 text-green-800';
            case TransactionType.CHARGE:
                return 'bg-red-100 text-red-800';
            case TransactionType.REFUND:
                return 'bg-blue-100 text-blue-800';
            case TransactionType.ADJUSTMENT:
                return 'bg-yellow-100 text-yellow-800';
            case TransactionType.REVERSAL:
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatAmount = (amount: number, type: TransactionType) => {
        const sign = type === TransactionType.PAYMENT || type === TransactionType.REFUND ? '-' : '+';
        return `${sign}₹${Math.abs(amount).toFixed(2)}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Transaction Ledger
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="space-y-2">
                    {transactions.map((transaction) => (
                        <div
                            key={transaction._id}
                            className={`p-4 border-l-4 ${transaction.isReversed
                                    ? 'opacity-60 bg-gray-50 border-gray-300'
                                    : 'bg-white border-primary'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge className={getTransactionTypeColor(transaction.type)}>
                                            {transaction.type}
                                        </Badge>
                                        <span className="text-lg font-semibold">
                                            {formatAmount(transaction.amount, transaction.type)}
                                        </span>
                                        {transaction.isReversed && (
                                            <Badge variant="outline" className="text-xs">
                                                REVERSED
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span>{new Date(transaction.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                        {transaction.paymentMethod && (
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4" />
                                                <span>{transaction.paymentMethod}</span>
                                            </div>
                                        )}
                                        {transaction.remarks && (
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4" />
                                                <span className="truncate">{transaction.remarks}</span>
                                            </div>
                                        )}
                                    </div>

                                    {transaction.balanceAfter !== undefined && (
                                        <div className="mt-2 text-sm">
                                            <span className="text-muted-foreground">Balance After: </span>
                                            <span className="font-medium">₹{transaction.balanceAfter.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="ml-4">
                                    {transaction.type !== TransactionType.REVERSAL && !transaction.isReversed && (
                                        <ReverseDialog transaction={transaction} />
                                    )}
                                </div>
                            </div>

                            {transaction.idempotencyKey && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                    ID: {transaction.idempotencyKey}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
