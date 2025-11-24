"use client";

import useBillPayment from "@/hooks/useBillPayment";
import { PaymentContext } from "@/lib/context/payment";
import PaymentStatusDialog from "@/components/PaymentStatusDialog";

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const billPayment = useBillPayment();
  return (
    <PaymentContext.Provider value={billPayment}>
      {children}
      <PaymentStatusDialog
        open={billPayment.isDialogOpen}
        status={billPayment.status}
        error={billPayment.error}
        data={billPayment.data}
        onClose={billPayment.closeDialog}
      />
    </PaymentContext.Provider>
  );
}
