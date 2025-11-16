// hooks/useProducts.ts
import { payBill } from "@/api/pay-bill";
import { useMutation } from "@tanstack/react-query";

export function usePayBillQuery() {
  return useMutation({
    mutationFn: payBill,
  });
}
