'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Customer, TransactionType } from '@/types';
import { CustomerSelect } from './CustomerSelect';
import { TransactionFormDialog } from './TransactionFormDialog';
import { TransactionTable } from './TransactionTable';
import { ReconcileButton } from './ReconcileButton';
import { Plus, Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function TransactionPage() {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header showSearch={false} />

            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <PageHeader
                    title="Transaction Management"
                    description="Manage customer transactions, payments, and account balances"
                />

                {/* Customer Selection */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Select Customer
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <CustomerSelect
                                    value={selectedCustomer}
                                    onChange={setSelectedCustomer}
                                />
                            </div>
                            {selectedCustomer && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedCustomer(null)}
                                    >
                                        Clear
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {selectedCustomer && (
                    <>
                        {/* Customer Info & Balance */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Customer Information</span>
                                    <div className="flex items-center gap-2">
                                        <TransactionFormDialog customer={selectedCustomer} />
                                        <ReconcileButton customerId={selectedCustomer._id} />
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <h3 className="font-semibold text-lg">{selectedCustomer.userId.name}</h3>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            {selectedCustomer.phone && (
                                                <p>Phone: {selectedCustomer.phone}</p>
                                            )}
                                            {selectedCustomer.contact && (
                                                <p>Contact: {selectedCustomer.contact}</p>
                                            )}
                                            {selectedCustomer.email && (
                                                <p>Email: {selectedCustomer.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            <span className="text-sm font-medium">Current Balance:</span>
                                        </div>
                                        <div className="text-2xl font-bold">
                                            ₹{(selectedCustomer.currentBalance || 0).toFixed(2)}
                                        </div>
                                        <Badge
                                            variant={selectedCustomer.currentBalance && selectedCustomer.currentBalance < 0 ? 'destructive' : 'default'}
                                            className="text-xs"
                                        >
                                            {selectedCustomer.currentBalance && selectedCustomer.currentBalance < 0 ? 'Credit' : 'Debit'}
                                        </Badge>
                                    </div>

                                    {selectedCustomer.creditLimit && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                <span className="text-sm font-medium">Credit Limit:</span>
                                            </div>
                                            <div className="text-lg font-semibold">
                                                ₹{selectedCustomer.creditLimit.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Available: ₹{((selectedCustomer.creditLimit || 0) - (selectedCustomer.currentBalance || 0)).toFixed(2)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transaction Ledger */}
                        <TransactionTable customerId={selectedCustomer._id} />
                    </>
                )}

                {!selectedCustomer && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Customer Selected</h3>
                            <p className="text-muted-foreground mb-4">
                                Select a customer from the dropdown above to view their transaction history and manage their account.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
