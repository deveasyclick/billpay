import BillSelectTrigger from "@/components/SelectTrigger";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { TVFormValues } from "../tv.schema";
import { useEffect, useState } from "react";
import type { BillingItem } from "@/types";

interface Props {
  form: UseFormReturn<TVFormValues>;
  items: BillingItem[];
}

export default function TVBundle({ form, items }: Props) {
  const [packages, setPackages] = useState<BillingItem[]>([]);
  const providers = Array.from(new Set(items.map((item) => item.biller.name)));

  const provider = form.watch("provider");
  useEffect(() => {
    if (provider) {
      const packages = items.filter((item) => item.biller.name === provider);
      setPackages(packages);
    }
  }, [provider]);

  return (
    <div className="flex flex-col gap-8">
      {/* Network Selector */}
      <FormField
        control={form.control}
        name="provider"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="text-gray-800 dark:text-gray-200">
              Select Service Provider
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <BillSelectTrigger placeholder="Choose provider" />
              </FormControl>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
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
        name="package"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="text-gray-800 dark:text-gray-200">
              Select Package
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <BillSelectTrigger placeholder="Choose package" />
              </FormControl>
              <SelectContent>
                {packages.map((p) => (
                  <SelectItem key={p.internalCode} value={p.internalCode}>
                    {`${p.name} (₦${Math.round(p.amount / 100)})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
