export interface CreatePayment {
    orderId: string
}

export interface verifyPayment {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export enum PaymentStatus {
    CREATED = 'created',
    AUTHORIZED = 'authorized',
    CAPTURED = 'captured',
    REFUNDED = 'refunded',
    FAILED = 'failed',
}

export interface RazorpayOrderResponse {
    id: string;
    entity: "order";
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    offer_id: string | null;
    status: PaymentStatus;
    attempts: number;
    notes: Record<string, any> | any[];
    created_at: number;
}