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
import TestCodes from "@/components/TestCodes";

const AIRTIME_TEST_NUMBERS = [
  { number: "08011111111", label: "Success" },
  { number: "201000000000", label: "Pending" },
  { number: "400000000000", label: "No Response" },
  { number: "300000000000", label: "Timeout" },
  { number: "500000000000", label: "Unexpected Response" },
];

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

  return (
    <div className="w-full max-w-lg bg-white dark:bg-gray-900">
      <TestCodes
        testCodes={AIRTIME_TEST_NUMBERS}
        onSelect={(number) => form.setValue("phone", number)}
      />

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
          <AirtimeSummary
            phone={form.watch("phone")}
            amount={form.watch("amount")}
          />

          {/* Submit */}
          <PaymentButton disabled={!form.formState.isValid} />
        </form>
      </Form>
    </div>
  );
}
