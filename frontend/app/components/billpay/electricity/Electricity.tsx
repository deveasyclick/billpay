"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import BillInput from "@/components/Input";
import BillSelectTrigger from "@/components/SelectTrigger";
import PaymentButton from "@/components/buttons/PaymentButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import { useBillingItems } from "@/lib/context/itemContext";
import { usePayment } from "@/lib/context/payment";
import { cn } from "@/lib/utils";
import Image from "next/image";
import ElectricityAmount from "./components/ElectricityAmount";
import ElectricitySummary from "./components/ElectricitySummary";
import { ElectricityFormValues, ElectricitySchema } from "./electricity.schema";
import { toast } from "sonner";
import { Category } from "@/types";
import { useValidateCustomer } from "../../../../queries/validate-customer";
import { Check } from "lucide-react";
import { useEffect } from "react";
import TestCodes from "@/components/TestCodes";

const ELECTRICITY_TEST_CODES = [
  { number: "1111111111111", label: "Success", description: "Prepaid" },
  { number: "1010101010101", label: "Success", description: "Postpaid" },
  { number: "201000000000", label: "Pending" },
  { number: "400000000000", label: "No Response" },
  { number: "300000000000", label: "Timeout" },
  { number: "500000000000", label: "Unexpected Response" },
];
export default function Electricity() {
  const { electricityItems } = useBillingItems();
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
  const { payBill, status } = usePayment();

  const form = useForm<ElectricityFormValues>({
    resolver: zodResolver(ElectricitySchema),
    defaultValues: {
      provider: "",
      meterNumber: "",
      amount: "",
      plan: "Prepaid",
    },
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
      form.setError("meterNumber", {
        message: error?.message ?? "Validation failed",
      });
    }
  }, [isError, error, form]);
  const onSubmit = (data: ElectricityFormValues) => {
    const item = electricityItems.find(
      (item) => item.internalCode === data.provider
    );
    if (!item) {
      toast.error("Payment failed. Please try again later.");
      throw new Error("Item not found");
    }

    if (isIdle || !isSuccess) {
      form.clearErrors("meterNumber");
      validateCustomer({
        customerId: data.meterNumber,
        paymentCode: item.biller.billerId,
        provider: item.provider.name,
      });
      return;
    }

    payBill({
      amount: Number(data.amount),
      billingItemId: item.id,
      customerId: data.meterNumber,
      category: Category.ELECTRICITY,
      plan: data.plan.toLocaleLowerCase(),
    });
  };

  const meterNumber = form.watch("meterNumber");
  const amount = form.watch("amount");

  return (
    <div className="w-full max-w-lg bg-white dark:bg-gray-900">
      <TestCodes
        testCodes={ELECTRICITY_TEST_CODES}
        onSelect={(number) =>
          form.setValue("meterNumber", number, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="plan"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-sm font-medium text-gray-700">
                  Select a Plan
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <div className="flex items-start gap-1.5 self-stretch w-full">
                      <Label
                        htmlFor="r1"
                        onClick={() => field.onChange("Prepaid")}
                        className={cn(
                          "flex p-3 items-center gap-[7.412px] self-stretch border-[0.741px] border-[#E5E5E5] rounded-[11.859px] shadow-right-bottom w-1/2 cursor-pointer",
                          field.value === "Prepaid" && "border-[#2563EB] border"
                        )}
                      >
                        <RadioGroupItem
                          value="Prepaid"
                          id="r1"
                          className="data-[state=checked]:bg-blue-500 [&_svg]:fill-white"
                        />
                        <span>Prepaid</span>
                      </Label>
                      <Label
                        htmlFor="r2"
                        className={cn(
                          "flex p-3 items-center gap-[7.412px] self-stretch border-[0.741px] border-[#E5E5E5] rounded-[11.859px] shadow-right-bottom w-1/2 cursor-pointer",
                          field.value === "Postpaid" &&
                            "border-[#2563EB] border"
                        )}
                      >
                        <RadioGroupItem
                          value="Postpaid"
                          id="r2"
                          className="data-[state=checked]:bg-blue-500 [&_svg]:fill-white"
                        />
                        <span>Postpaid</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-gray-800 dark:text-gray-200">
                  Select Provider
                </FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value)}
                  value={field.value}
                >
                  <FormControl>
                    <BillSelectTrigger placeholder="Choose provider" />
                  </FormControl>
                  <SelectContent>
                    {electricityItems.map((item) => (
                      <SelectItem
                        key={item.internalCode}
                        value={item.internalCode}
                      >
                        <Image
                          src={item.image ?? "/logo.png"}
                          alt={item.name}
                          width={20}
                          height={20}
                        />
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meterNumber"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-gray-800 dark:text-gray-200">
                  Meter Number
                </FormLabel>
                <FormControl>
                  <BillInput
                    {...field}
                    placeholder="Enter meter's number"
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

          {/* Amount */}
          <ElectricityAmount form={form} />

          {/* Summary */}
          <ElectricitySummary meterNumber={meterNumber} amount={amount} />

          {/* Submit */}
          <PaymentButton disabled={isPending || isError} />
        </form>
      </Form>
    </div>
  );
}
