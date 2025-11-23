"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import BillingItemProvider from "./items";
import { PaymentProvider } from "./payment";
import type { BillingItem } from "@/types";

export default function Providers({
  children,
  items,
}: {
  children: ReactNode;
  items: BillingItem[];
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <BillingItemProvider items={items}>
        <PaymentProvider>{children}</PaymentProvider>
      </BillingItemProvider>
    </QueryClientProvider>
  );
}
