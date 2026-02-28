import { env } from "@/lib/env";
import { getErrorMessage } from "@/lib/error";
import type { CreatePaymentRequest, CreatePaymentResponse } from "@/types";

export async function CreatePayment(
  createPaymentObject: CreatePaymentRequest
): Promise<CreatePaymentResponse["data"]> {
  const res = await fetch(`${env.apiBaseUrl}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(createPaymentObject),
  });
  let json: CreatePaymentResponse;
  try {
    json = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    throw new Error(getErrorMessage(json, "Failed to create payment"));
  }
  return json.data;
}
