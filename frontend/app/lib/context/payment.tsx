"use client";

import { createContext, useContext } from "react";
import useBillPayment from "@/hooks/useBillPayment";

export const PaymentContext = createContext<ReturnType<
  typeof useBillPayment
> | null>(null);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
};
