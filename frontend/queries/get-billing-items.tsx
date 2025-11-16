import { getBillingItems } from "@/api/get-billing-items";
import { useQuery } from "@tanstack/react-query";

export function useGetBillingItems() {
  return useQuery({
    queryKey: ["get-billing-items"],
    queryFn: getBillingItems,
    select: (data) => data.data,
    staleTime: 12 * 60 * 60 * 1000, // 1 day
    retry: true,
  });
}
