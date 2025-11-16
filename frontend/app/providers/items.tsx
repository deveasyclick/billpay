import { BillingItemContext } from "@/lib/context/itemContext";
import { useGetBillingItems } from "../../queries/get-billing-items";
import { useEffect, useState } from "react";
import type { BillingItem, Category } from "@/types";

export default function BillingItemProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [groupedItems, setGroupedItems] = useState<
    Record<Category, BillingItem[]>
  >({
    DATA: [],
    AIRTIME: [],
    TV: [],
    ELECTRICITY: [],
  });
  const { data: items, isSuccess } = useGetBillingItems();

  useEffect(() => {
    if (!isSuccess || !items) return;
    const grouped: Record<Category, BillingItem[]> = {
      DATA: [],
      AIRTIME: [],
      TV: [],
      ELECTRICITY: [],
    };

    items.forEach((item) => {
      grouped[item.category]?.push(item);
    });

    setGroupedItems(grouped);
  }, [isSuccess, items]);

  return (
    <BillingItemContext.Provider
      value={{
        dataItems: groupedItems.DATA,
        airtimeItems: groupedItems.AIRTIME,
        tvItems: groupedItems.TV,
        electricityItems: groupedItems.ELECTRICITY,
      }}
    >
      {children}
    </BillingItemContext.Provider>
  );
}
