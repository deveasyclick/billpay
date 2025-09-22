import "server-only";

export async function getBillingItems() {
  const res = await fetch("http://localhost:4000/api/v1/bills/items");
  return res.json();
}
