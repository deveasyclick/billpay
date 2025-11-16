import { env } from "@/lib/env";
import type { PayBillRequest, PayBillResponse } from "@/types";

export async function payBill(
  data: PayBillRequest
): Promise<PayBillResponse["data"]> {
  const res = await fetch(`${env.apiBaseUrl}/bills/pay`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  let payBillResponse: PayBillResponse;
  try {
    payBillResponse = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    throw new Error(payBillResponse?.message ?? "Bill payment failed");
  }

  return payBillResponse.data;
}
