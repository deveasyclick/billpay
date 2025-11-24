"use client";

import { env } from "@/lib/env";
import type { Category, PayBillResponse, Providers } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { useCreatePayment } from "../../queries/create-payment";
import { usePayBillQuery } from "../../queries/pay-bill";
import Paystack from "@paystack/inline-js";

type CheckoutOptions = {
  amount: number; // in minor units
  site_redirect_path?: string;
  billingItemId: string;
  category: Category;
  plan?: string;
  customerId: string; // phone number, meter number, decoder number, etc.
  provider?: Providers;
};

export default function useBillPayment() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PayBillResponse["data"] | null>(null);
  const { mutateAsync: createPayment } = useCreatePayment();
  const { mutateAsync: payBill } = usePayBillQuery();

  const pay = async ({
    amount,
    billingItemId,
    customerId,
    category,
    plan,
    provider,
  }: CheckoutOptions) => {
    setStatus("loading");
    setError(null);
    try {
      const payment = await createPayment({
        customerId,
        amount,
        billingItemId,
        category,
        plan,
      });

      new Paystack().newTransaction({
        key: env.paystackPublicKey,
        email: env.paystackEmail,
        amount: payment.amount * 100,
        channels: ["card"],
        reference: payment.paymentReference,
        onSuccess: async (transaction) => {
          try {
            const result = await payBill({
              paymentReference: payment.paymentReference,
              billingItemId,
              ...(provider && { provider }),
            });
            setData(result);
            setStatus("success");
            setError(null);
          } catch (err: any) {
            console.log(err);
            setStatus("error");
            setError(err.message);
          }
        },
        onLoad: (response) => {
          console.log("onLoad: ", response);
        },
        onCancel: () => {
          setStatus("idle");
          toast.error("Payment cancelled 😢");
        },
        onError: (error) => {
          console.log("Error: ", error.message);
          setError(error.message);
          setStatus("error");
        },
      });
    } catch (e: any) {
      setError(e.message);
      setStatus("error");
      setData(null);
    }
  };

  return { payBill: pay, error, status, data };
}
