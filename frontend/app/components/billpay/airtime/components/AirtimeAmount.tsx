import BillInput from "@/components/Input";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { AirtimeFormValues } from "../airtime.schema";
import { useState } from "react";

interface Props {
  form: UseFormReturn<AirtimeFormValues>;
  selectedAmount: string;
  setSelectedAmount: (val: string) => void;
  isCustom: boolean;
  setIsCustom: (val: boolean) => void;
}

export default function AirtimeAmount({ form }: Props) {
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const selectedAmount = form.watch("amount");

  return (
    <div className="space-y-2">
      <FormLabel className="text-gray-800 dark:text-gray-200">Amount</FormLabel>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {["100", "200", "500", "1000"].map((value) => (
          <Button
            key={value}
            type="button"
            onClick={() => {
              form.setValue("amount", value, {
                shouldValidate: true,
                shouldDirty: true,
              });
              setIsCustom(false);
            }}
            variant="outline"
            className={cn(
              "h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
              selectedAmount === value && !isCustom && "border-primary border-2"
            )}
          >
            {value === "other" ? "Other" : `₦${value}`}
          </Button>
        ))}
        <Button
          key={"custom"}
          type="button"
          onClick={() => setIsCustom(true)}
          variant="outline"
          className={cn(
            "h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
            isCustom && "border-primary border-2"
          )}
        >
          Other
        </Button>
      </div>

      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="relative">
                <BillInput
                  {...field}
                  type="number"
                  placeholder="Enter amount"
                  disabled={!isCustom}
                  className={cn(field.value && "pl-6")}
                />
                <span
                  className={cn(
                    "absolute top-2.5 left-2 opacity-30 hidden",
                    field.value && "inline"
                  )}
                >
                  ₦
                </span>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
