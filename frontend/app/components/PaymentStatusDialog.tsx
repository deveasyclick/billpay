"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { PayBillResponse } from "@/types";

interface PaymentStatusDialogProps {
  open: boolean;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  data: PayBillResponse["data"] | null;
  onClose: () => void;
}

export default function PaymentStatusDialog({
  open,
  status,
  error,
  data,
  onClose,
}: PaymentStatusDialogProps) {
  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : onClose}>
      <DialogContent
        showCloseButton={!isLoading}
        className="sm:max-w-md"
        onPointerDownOutside={(e) => {
          if (isLoading) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isLoading) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {isLoading && (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                <DialogTitle className="text-center">
                  Processing Payment
                </DialogTitle>
                <DialogDescription className="text-center">
                  Please wait while we process your payment...
                </DialogDescription>
              </>
            )}

            {isSuccess && (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-600" />
                <DialogTitle className="text-center">
                  Payment Successful!
                </DialogTitle>
                <DialogDescription className="text-center">
                  Your payment has been processed successfully.
                </DialogDescription>
              </>
            )}

            {isError && (
              <>
                <XCircle className="h-16 w-16 text-red-600" />
                <DialogTitle className="text-center">
                  Payment Failed
                </DialogTitle>
                <DialogDescription className="text-center text-red-600">
                  {error || "An error occurred while processing your payment."}
                </DialogDescription>
              </>
            )}
          </div>
        </DialogHeader>

        {(isSuccess || isError) && data && (
          <div className="space-y-3 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Reference:
              </span>
              <span className="font-medium">{data.paymentRef}</span>
            </div>
            {data.amount && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Amount:
                </span>
                <span className="font-medium">
                  ₦{Number(data.amount).toFixed(2)}
                </span>
              </div>
            )}

            {Object.keys(data.metadata).length > 0 &&
              Object.entries(data.metadata).map(([key, value]) => (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {key}:
                  </span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
          </div>
        )}

        {!isLoading && (
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={onClose}
              className="w-full sm:w-auto"
              variant={isSuccess ? "default" : "destructive"}
            >
              {isSuccess ? "Done" : "Close"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
