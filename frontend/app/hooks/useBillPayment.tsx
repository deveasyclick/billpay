import { env } from "@/lib/env";
import type { Category, PayBillResponse, Providers } from "@/types";
import type { InterSwitchCheckoutResponse } from "@/types/checkout";
import { useState } from "react";
import { toast } from "sonner";
import { useCreatePayment } from "../../queries/create-payment";
import { usePayBillQuery } from "../../queries/pay-bill";

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
    site_redirect_path = "/",
    category,
    plan,
    provider,
  }: CheckoutOptions) => {
    if (!window.webpayCheckout) {
      toast.info("Checkout loading, try again later");
      return;
    }
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

      //validateAmount(options.amount, options.amountType);
      window.webpayCheckout({
        amount: payment.amount * 100,
        currency: 566, // NGN
        site_redirect_url: `${window.location.origin}${site_redirect_path}`,
        cust_id: customerId,
        merchant_code: env.interswitchMerchantCode,
        pay_item_id: env.interswitchPayItemId,
        txn_ref: payment.paymentReference,
        mode: env.environment === "production" ? "LIVE" : "TEST",
        pay_item_name: billingItemId,
        onComplete: async (resp: InterSwitchCheckoutResponse) => {
          console.log("resp", resp);
          if (resp.resp === "Z6") {
            toast.error("Payment cancelled 😢");
            return;
          }
          if (resp.resp === "00") {
            const result = await payBill({
              paymentReference: payment.paymentReference,
              billingItemId,
              ...(provider && { provider }),
            });
            setData(result);
            setStatus("success");
            setError(null);
          }
          setError("An error occurred. Please try again later.");
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
