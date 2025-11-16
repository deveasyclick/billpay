"use client";

import BillSelectTrigger from "@/components/SelectTrigger";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import type { BillingItem } from "@/types";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { DataFormValues } from "../data.schema";
import { formatBundleName } from "../utils";
import { BundleCard } from "./BundleCard";
import { cast } from "@/lib/cast";

interface Props {
  form: UseFormReturn<DataFormValues>;
  bundles: BillingItem[];
}

export default function DataBundleSelector({ form, bundles }: Props) {
  const [isCustom, setIsCustom] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <FormField
        control={form.control}
        name="bundle"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-800 dark:text-gray-200">
              Choose a Data BundleCard
            </FormLabel>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {bundles?.slice(0, 4).map((b) => (
                <BundleCard
                  key={b.internalCode}
                  bundle={b}
                  checked={!isCustom && field.value === b.internalCode}
                  handleChecked={() => {
                    field.onChange(b.internalCode);
                    setIsCustom(false);
                  }}
                />
              ))}
              <BundleCard
                bundle={{
                  name: "Other",
                  amount: cast("Custom"),
                  internalCode: "custom",
                }}
                checked={isCustom}
                handleChecked={() => {
                  setIsCustom(true);
                }}
              />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {isCustom && (
        <FormField
          control={form.control}
          name="bundle"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <BillSelectTrigger placeholder="Choose network" />
                </FormControl>
                <SelectContent>
                  {bundles.map((b) => (
                    <SelectItem key={b.internalCode} value={b.internalCode}>
                      {formatBundleName(b.name, 50)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
