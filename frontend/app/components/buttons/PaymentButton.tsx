import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";

interface PaymentButtonProps {
  disabled?: boolean;
  status?: "idle" | "loading" | "success" | "error";
}
export default function PaymentButton({
  disabled = false,
  status = "idle",
}: PaymentButtonProps) {
  return (
    <Button
      type="submit"
      className="h-12 w-full text-base font-bold"
      disabled={disabled}
    >
      {status !== "loading" && (
        <>
          Proceed to Payment
          <ShieldCheck />
        </>
      )}
      {status === "loading" && (
        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
      )}
    </Button>
  );
}
