"use client";

import PaymentButton from "@/components/buttons/PaymentButton";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import DataBundleSelector from "./components/DataBundleSelector";
import { DataFormValues, DataSchema } from "./data.schema";
import NetworkAndPhone from "@/components/billpay/NetworkAndPhone";
import { useBillingItems } from "@/lib/context/itemContext";
import { useEffect, useState } from "react";
import { Category, type BillingItem } from "@/types";
import { usePayment } from "@/lib/context/payment";
import { toast } from "sonner";

export default function DataTab() {
  const [bundleItems, setBundleItems] = useState<BillingItem[]>([]);
  const { dataItems } = useBillingItems();
  const { payBill } = usePayment();
  const form = useForm<DataFormValues>({
    resolver: zodResolver(DataSchema),
    defaultValues: {
      network: "mtn",
      bundle: "",
      phone: "",
    },
    mode: "onChange",
  });
  const onSubmit = (data: DataFormValues) => {
    const item = dataItems.find((item) => item.internalCode === data.bundle);
    if (!item) {
      toast.error("Payment failed. Please try again later.");
      throw new Error("Item not found");
    }

    payBill({
      amount: Number(item.amount),
      billingItemId: item.id,
      customerId: data.phone,
      category: Category.DATA,
    });
  };
  const selectedNetwork = form.watch("network");
  useEffect(() => {
    if (selectedNetwork) {
      setBundleItems(
        dataItems.filter((item) =>
          item.biller.name
            .toLocaleLowerCase()
            .includes(selectedNetwork.toLocaleLowerCase())
        )
      );
    }
  }, [selectedNetwork, dataItems]);

  return (
    <div className="w-full max-w-lg bg-white dark:bg-gray-900">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <NetworkAndPhone form={form} />
          {/* Show bundle options only when network is chosen */}
          {selectedNetwork && (
            <DataBundleSelector form={form} bundles={bundleItems} />
          )}

          <PaymentButton disabled={!form.formState.isValid} />
        </form>
      </Form>
    </div>
  );
}
