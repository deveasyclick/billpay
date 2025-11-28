import { UseFormReturn } from "react-hook-form";
import BillInput from "../Input";
import BillSelectTrigger from "../SelectTrigger";
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Select, SelectContent, SelectItem } from "../ui/select";

const networks = ["mtn", "airtel", "glo", "9mobile"];

interface NetworkAndPhoneProps {
  form: UseFormReturn<any>;
}
export default function NetworkAndPhone({ form }: NetworkAndPhoneProps) {
  return (
    <div className="grid grid-cols-8 md:grid-cols-5 w-full gap-2">
      <FormField
        control={form.control}
        name="network"
        render={({ field }) => (
          <FormItem className="w-full col-span-2 md:col-span-1 flex">
            <Select
              onValueChange={(value) => field.onChange(value)}
              defaultValue={field.value}
            >
              <FormControl>
                <BillSelectTrigger placeholder="Choose network" />
              </FormControl>
              <SelectContent>
                {networks.map((network) => (
                  <SelectItem key={network} value={network}>
                    {network.toUpperCase()}
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
        name="phone"
        render={({ field }) => (
          <FormItem className="w-full col-span-6 md:col-span-4">
            <FormControl>
              <BillInput
                {...field}
                placeholder="Enter recipient's phone number"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
