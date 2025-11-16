import { env } from "@/lib/env";
import type { BillingItem } from "@/types";

type GetBillingItemsResponse = { data: BillingItem[] };
export async function getBillingItems(): Promise<GetBillingItemsResponse> {
  const res = await fetch(`${env.apiBaseUrl}/bills/items`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  let json: GetBillingItemsResponse;
  try {
    json = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch billing items ${res.statusText}`);
  }

  return json;
}
