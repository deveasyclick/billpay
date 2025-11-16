"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import BillingItemProvider from "./items";
import { PaymentProvider } from "./payment";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <BillingItemProvider>
        <PaymentProvider>{children}</PaymentProvider>
      </BillingItemProvider>
    </QueryClientProvider>
  );
}
