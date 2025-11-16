"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import NetworkAndPhone from "@/components/billpay/NetworkAndPhone";
import PaymentButton from "@/components/buttons/PaymentButton";
import { Form } from "@/components/ui/form";
import { AirtimeFormValues, AirtimeSchema } from "./airtime.schema";
import AirtimeAmount from "./components/AirtimeAmount";
import AirtimeSummary from "./components/AirtimeSummary";
import { useBillingItems } from "@/lib/context/itemContext";
import { Category } from "@/types";
import { toast } from "sonner";
import { usePayment } from "@/lib/context/payment";

export default function Airtime() {
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const { airtimeItems } = useBillingItems();
  const { payBill } = usePayment();

  const form = useForm<AirtimeFormValues>({
    resolver: zodResolver(AirtimeSchema),
    defaultValues: {
      network: "mtn",
      phone: "",
      amount: "",
    },
    mode: "onChange",
  });

  const onSubmit = (data: AirtimeFormValues) => {
    const item = airtimeItems.find(
      (item) =>
        (item.amountType === 0 || Number(item.amount) === 0) &&
        item.biller.name.toLowerCase().includes(data.network)
    );

    if (!item) {
      toast.error("Payment failed. Please try again later.");
      throw new Error("Item not found");
    }

    payBill({
      amount: Number(data.amount),
      billingItemId: item.id,
      customerId: data.phone,
      category: Category.AIRTIME,
    });
  };

  const phone = form.watch("phone");
  const amount = form.watch("amount");

  return (
    <div className="w-full max-w-lg bg-white dark:bg-gray-900">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Network & Phone row */}
          <NetworkAndPhone form={form} />

          {/* Amount */}
          <AirtimeAmount
            form={form}
            selectedAmount={selectedAmount}
            setSelectedAmount={setSelectedAmount}
            isCustom={isCustom}
            setIsCustom={setIsCustom}
          />

          {/* Summary */}
          <AirtimeSummary phone={phone} amount={amount} />

          {/* Submit */}
          <PaymentButton disabled={!form.formState.isValid} />
        </form>
      </Form>
    </div>
  );
}
