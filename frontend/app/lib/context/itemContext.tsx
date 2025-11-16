"use client";

import type { BillingItem } from "@/types";
import { createContext, useContext } from "react";

type BillingItemContextType = {
  dataItems: BillingItem[];
  airtimeItems: BillingItem[];
  tvItems: BillingItem[];
  electricityItems: BillingItem[];
};
export const BillingItemContext = createContext<BillingItemContextType>({
  dataItems: [],
  airtimeItems: [],
  tvItems: [],
  electricityItems: [],
});

export const useBillingItems = () => {
  const context = useContext(BillingItemContext);
  if (!context) {
    throw new Error(
      "useBillingItems must be used within a BillingItemProvider"
    );
  }
  return context;
};
