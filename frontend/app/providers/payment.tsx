import useBillPayment from "@/hooks/useBillPayment";
import { PaymentContext } from "@/lib/context/payment";

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const billPayment = useBillPayment();

  return (
    <PaymentContext.Provider value={billPayment}>
      {children}
    </PaymentContext.Provider>
  );
}
