import { BillingItemContext } from "@/lib/context/itemContext";
import { useEffect, useState } from "react";
import type { BillingItem, Category } from "@/types";
import { getBillingItems } from "@/api/get-billing-items";

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
  //const { data: items, isSuccess } = useGetBillingItems();
  useEffect(() => {
    async function fetchItems() {
      try {
        const { data: items } = await getBillingItems();
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
      } catch (err) {
        console.error("error  fetching items", err);
      }
    }

    fetchItems();
  }, []);

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
