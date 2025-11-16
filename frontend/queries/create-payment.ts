// hooks/useProducts.ts
import { CreatePayment } from "@/api/create-payment";
import { useMutation } from "@tanstack/react-query";

export function useCreatePayment() {
  return useMutation({
    mutationFn: CreatePayment,
  });
}
