import { CreatePayment, RazorpayOrderResponse, verifyPayment } from "@/types/payment.types";
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError, queryKeys } from "./api-advance";
import { DETAILS } from "@/public/details";
import { toast } from "sonner";

export const useCreatePaymentOrder = (
    options?: UseMutationOptions<RazorpayOrderResponse, ApiError, CreatePayment>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePayment) =>
            apiClient.payForOrder(data),
        onSuccess: (response) => {
            // Debug: Log the full response to understand its structure
            console.log('Full API Response:', response);
            console.log('Response type:', typeof response);

            // Extract order data - it might be nested or wrapped
            const order = response;
            console.log('Order object:', order);

            // Invalidate and refetch payments queries
            queryClient.invalidateQueries({ queryKey: queryKeys.payments() });

            // Validate order data
            if (!order || !order.id || !order.amount || !order.currency) {
                console.error('Invalid order data received:', order);
                return;
            }

            // Check if Razorpay script is loaded
            if (typeof (window as any).Razorpay === 'undefined') {
                console.error('Razorpay script not loaded. Add the script tag to your HTML.');
                return;
            }

            // Validate required environment variable
            const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
            console.log('Environment check:', {
                NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
                resolvedKeyId: razorpayKeyId
            });

            if (!razorpayKeyId || razorpayKeyId === 'your_razorpay_key_here') {
                console.error('Razorpay Key ID not found in environment variables or using placeholder value');
                toast.error('Razorpay configuration error. Please check environment variables.');
                return;
            }

            const razorpayOptions = {
                key: razorpayKeyId,
                amount: order.amount,
                currency: order.currency,
                name: DETAILS.NAME,
                description: "Test Transaction",
                order_id: order.id,
                // Remove callback_url for client-side integration
                handler: function (response: any) {
                    console.log('Payment successful:', response);
                    // Handle successful payment here
                    // You can call another API to verify payment
                    // verifyPayment(response);
                },
                modal: {
                    ondismiss: function () {
                        console.log('Payment modal dismissed');
                    }
                },
                prefill: {
                    name: "Customer Name",
                    email: "customer@example.com",
                    contact: "9000000000",
                },
                theme: {
                    color: "#F37254",
                },
                // Enable retry for better UX
                retry: {
                    enabled: true,
                    max_count: 4
                },
                // Force enable all payment methods including UPI
                method: {
                    netbanking: true,
                    wallet: true,
                    upi: true,
                    card: true,
                    emi: true,
                },
                // Additional configuration for UPI
                notes: {
                    source: "razorpay_integration"
                }
            };

            console.log('Razorpay options:', razorpayOptions);
            console.log('Razorpay script loaded:', typeof (window as any).Razorpay);
            console.log('Razorpay version:', (window as any).Razorpay?.version);

            try {
                const rzp = new (window as any).Razorpay(razorpayOptions);
                console.log('Razorpay instance created:', rzp);
                rzp.open();
            } catch (error) {
                console.error('Error opening Razorpay:', error);
                toast.error('Failed to open payment gateway. Please try again.');
            }
        },
        onError: (error) => {
            console.error('Failed to create payment order:', error);
            // You might want to show a user-friendly error message here
        },
        ...options,
    });
};


export const useVerifyPaymentOrder = (
    options?: UseMutationOptions<{ success: true }, ApiError, verifyPayment>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: verifyPayment) =>
            apiClient.verifyPayment(data),
        onSuccess: (data) => {
            // Invalidate and refetch categories list
            queryClient.invalidateQueries({ queryKey: queryKeys.payments() });

        },
        onError: (error) => {
            console.error('Failed to verify payment order:', error);
        },
        ...options,
    });
};