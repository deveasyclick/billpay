import { BillingItemContext } from "@/lib/context/itemContext";
import { useEffect, useState } from "react";
import type { BillingItem, Category } from "@/types";

export default function BillingItemProvider({
  children,
  items,
}: {
  children: React.ReactNode;
  items: BillingItem[];
}) {
  const [groupedItems, setGroupedItems] = useState<
    Record<Category, BillingItem[]>
  >({
    DATA: [],
    AIRTIME: [],
    TV: [],
    ELECTRICITY: [],
  });
  //const { data: items, isSuccess } = useGetBillingItems();
  useEffect(() => {
    if (!items?.length) return;

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
  }, [items]);

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
