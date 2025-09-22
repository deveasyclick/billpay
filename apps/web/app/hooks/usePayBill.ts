// hooks/useProducts.ts
import { env } from "@/lib/env";
import { useMutation } from "@tanstack/react-query";

async function payBill(data: any) {
  const res = await fetch(`${env.apiBaseUrl}/bills/pay`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
  return res.json();
}

export function usePayBill() {
  return useMutation({
    mutationFn: payBill,
  });
}
