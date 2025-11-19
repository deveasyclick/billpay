"use client";

import PaymentButton from "@/components/buttons/PaymentButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import TVBundle from "./components/TvBundle";
import { TVFormValues, TVSchema } from "./tv.schema";
import BillInput from "@/components/Input";
import { useBillingItems } from "@/lib/context/itemContext";
import { usePayment } from "@/lib/context/payment";
import { toast } from "sonner";
import { Category } from "@/types";
import { useValidateCustomer } from "../../../../queries/validate-customer";
import { Check } from "lucide-react";
import { useEffect } from "react";
import TestCodes from "@/components/TestCodes";

const TV_TEST_CODES = [
  { number: "1212121212", label: "Success" },
  { number: "201000000000", label: "Pending" },
  { number: "400000000000", label: "No Response" },
  { number: "300000000000", label: "Timeout" },
  { number: "500000000000", label: "Unexpected Response" },
];
export default function TVTab() {
  const { tvItems } = useBillingItems();
  const { payBill, status } = usePayment();
  const {
    mutate: validateCustomer,
    isPending,
    isSuccess,
    isError,
    error,
    isIdle,
    data,
    reset,
  } = useValidateCustomer();

  const form = useForm<TVFormValues>({
    resolver: zodResolver(TVSchema),
    defaultValues: {
      provider: "",
      package: "",
      smartCardNumber: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (status === "success") {
      toast.success("Payment successful!");
      form.reset();
      reset();
    } else if (status === "error") {
      toast.error("Payment failed!");
    }
  }, [status, form, reset]);

  useEffect(() => {
    if (isError) {
      form.setError("smartCardNumber", {
        message: error?.message ?? "Validation failed",
      });
    }
  }, [isError, error, form]);
  const onSubmit = (data: TVFormValues) => {
    console.log("data", data);
    const item = tvItems.find((item) => item.internalCode === data.package);
    if (!item) {
      toast.error("Payment failed. Please try again later.");
      throw new Error("Item not found");
    }

    if (isIdle || !isSuccess) {
      form.clearErrors("smartCardNumber");
      validateCustomer({
        customerId: data.smartCardNumber,
        paymentCode: item.biller.billerId,
        provider: item.provider.name,
      });
      return;
    }

    payBill({
      amount: Number(item.amount),
      billingItemId: item.id,
      customerId: data.package,
      category: Category.TV,
    });
  };

  return (
    <div className="w-full max-w-lg bg-white dark:bg-gray-900">
      <TestCodes
        testCodes={TV_TEST_CODES}
        onSelect={(number) =>
          form.setValue("smartCardNumber", number, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <TVBundle form={form} items={tvItems} />
          <FormField
            control={form.control}
            name="smartCardNumber"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-gray-800 dark:text-gray-200">
                  Smart Card Number
                </FormLabel>
                <FormControl>
                  <BillInput
                    {...field}
                    placeholder="Enter smart card number"
                    onChange={(e) => {
                      field.onChange(e);
                      reset();
                    }}
                  />
                </FormControl>
                {isSuccess && (
                  <span className="text-blue-700 flex gap-1 text-[13px] items-center">
                    <Check className="w-4 h-4" />
                    {data.FullName}
                  </span>
                )}
                {isPending && (
                  <span className="text-orange-500 flex gap-2 text-xs">
                    Validating...
                  </span>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <PaymentButton disabled={isPending || isError} />
        </form>
      </Form>
    </div>
  );
}
