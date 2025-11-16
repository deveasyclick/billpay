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

export default function TVTab() {
  const { tvItems } = useBillingItems();
  const { payBill } = usePayment();
  const form = useForm<TVFormValues>({
    resolver: zodResolver(TVSchema),
    defaultValues: {
      provider: "",
      package: "",
      smartCardNumber: "",
    },
    mode: "onChange",
  });

  const onSubmit = (data: TVFormValues) => {
    console.log("data", data);
    const item = tvItems.find((item) => item.internalCode === data.package);
    if (!item) {
      toast.error("Payment failed. Please try again later.");
      throw new Error("Item not found");
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
                  <BillInput {...field} placeholder="Enter smart card number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <PaymentButton disabled={!form.formState.isValid} />
        </form>
      </Form>
    </div>
  );
}
