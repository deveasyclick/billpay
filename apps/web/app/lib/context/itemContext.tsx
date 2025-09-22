"use client"; // context must be client-side

import type { BillingItem } from "@/types/billingitem";
import { createContext, useContext } from "react";

const BillingItemContext = createContext<BillingItem[]>([]);

export const useBillingItems = () => useContext(BillingItemContext);

export function BillingItemProvider({
  value,
  children,
}: {
  value: BillingItem[];
  children: React.ReactNode;
}) {
  return (
    <BillingItemContext.Provider value={value}>
      {children}
    </BillingItemContext.Provider>
  );
}
