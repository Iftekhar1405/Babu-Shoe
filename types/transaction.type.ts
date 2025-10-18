export enum TransactionType {
  CHARGE = 'CHARGE',
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  ADJUSTMENT = 'ADJUSTMENT',
  REVERSAL = 'REVERSAL',
}

export type ObjectId = string;

export interface Transaction {
  _id: string;
  customerId: ObjectId;
  orderId?: ObjectId | null;
  type: TransactionType;
  amount: number;
  signedAmount: number;
  balanceAfter?: number;
  paymentMethod?: string;
  remarks?: string;
  idempotencyKey?: string;
  reversedFrom?: ObjectId | null;
  isReversed?: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CreateTransactionDto {
  customerId: string;
  orderId?: string;
  type: TransactionType;
  amount: number;
  paymentMethod?: string;
  remarks?: string;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

export interface ReverseTransactionDto {
  transactionId: string;
  reason?: string;
  idempotencyKey?: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  customerId?: string;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedTransactionResponse {
  rows: Transaction[];
  total: number;
  page: number;
  limit: number;
}

