import { cn } from "@/lib/utils";
import type { BillingItem } from "@/types";
import { formatBundleName } from "../utils";
import { memo } from "react";

interface BundleProps {
  bundle: Pick<BillingItem, "internalCode" | "name" | "amount">;
  checked: boolean;
  handleChecked: () => void;
}

export const BundleCard = memo(
  ({ bundle, checked, handleChecked }: BundleProps) => {
    return (
      <label
        className={cn(
          "flex cursor-pointer bundles-center gap-3 rounded-lg border border-solid border-gray-300 dark:border-gray-700 p-2 transition-all",
          checked && "border-primary ring-2 ring-primary/20"
        )}
        onClick={() => handleChecked()}
      >
        <input
          type="radio"
          value={bundle.internalCode}
          checked={checked}
          name="bundle"
          className="h-4 w-4 border-2 border-gray-300 dark:border-gray-600 bg-transparent text-primary focus:ring-primary focus:ring-offset-0 hidden sm:block"
          readOnly
        />
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatBundleName(bundle.name)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {!isNaN(+bundle.amount) && "₦"}
            {bundle.amount}
          </p>
        </div>
      </label>
    );
  }
);
