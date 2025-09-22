"use client";

import { env } from "@/lib/env";
import { cleanObject, generateTxnRef } from "@/lib/utils";
import type { InterSwitchCheckoutResponse } from "@/types/checkout";
import { toast } from "sonner";

type CheckoutOptions = {
  amount: number; // in minor units
  customerName?: string;
  customerEmail?: string;
  currency?: number; // ISO 4217 currency code
  site_redirect_path?: string;
  onComplete?: (response: InterSwitchCheckoutResponse) => void;
};

export function useInterswitchCheckout() {
  const checkout = ({
    amount,
    customerName,
    customerEmail,
    currency = 566, // NGN
    onComplete,
    site_redirect_path = "/",
  }: CheckoutOptions) => {
    if (!window.webpayCheckout) {
      toast.info("Checkout loading");
      return;
    }
    const options = {
      amount: amount * 100, // convert amount to kobo (1 naira = 100 kobo)
      currency, // NGN
      site_redirect_url: `${window.location.origin}${site_redirect_path}`,
      cust_name: customerName,
      cust_email: customerEmail,
    };
    const paymentReference = generateTxnRef();
    window.webpayCheckout({
      ...cleanObject(options),
      merchant_code: env.interswitchMerchantCode,
      pay_item_id: env.interswitchPayItemId,
      txn_ref: paymentReference,
      mode: env.environment === "production" ? "LIVE" : "TEST",
      onComplete: async (resp: InterSwitchCheckoutResponse) => {
        if (resp.resp === "Z6") {
          toast.error("Payment cancelled 😢");
          return;
        }
        await onComplete?.(resp);
      },
    });
  };

  return { checkout };
}
