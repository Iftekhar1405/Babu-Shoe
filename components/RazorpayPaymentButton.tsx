"use client";
import { useCreatePaymentOrder, useVerifyPaymentOrder } from "@/lib/payment.service";
import { useState } from "react";
import { Button } from "./ui/button";
import { Loader } from "lucide-react";
import { DETAILS } from "@/public/details";

export default function RazorPayButton({ orderId }: { orderId: string }) {

    const { mutate, isPending } = useCreatePaymentOrder()
    // const { mutate: verify, isPending: verificationPending } = useVerifyPaymentOrder()


    const startPayment = async () => {
        mutate({ orderId })
    };

    return (
        <Button
            onClick={startPayment}
            isLoading={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded"
        >
            Pay with Razorpay
        </Button>
    );
}
