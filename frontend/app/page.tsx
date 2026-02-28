import { getBillingItems } from "./api/get-billing-items";
import PaymentTabs from "./components/billpay/PaymentsTabs";
import Header from "./components/layouts/header";
import type { BillingItem } from "./types";
import Providers from "./providers";

export const dynamic = "force-dynamic";

export default async function BillPayPage() {
  let items: BillingItem[] = [];

  try {
    const response = await getBillingItems();
    items = response?.data ?? [];
  } catch (error) {
    console.error("Failed to fetch billing items:", error);
    items = [];
  }
  return (
    <Providers items={items}>
      <div className="min-h-screen flex flex-col bg-[#f5f6f8] dark:bg-[#0f1323] font-sans">
        <Header />

        <main className="flex px-4 sm:px-6 lg:px-10 py-8 w-full md:w-[600px] self-center gap-4">
          <div className="flex gap-8 mx-auto w-full">
            {/* Left: Payment Form */}
            <div className="space-y-6 w-full">
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                  Quick Bill Payment
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Pay bills for data, airtime, electricity, and TV subscriptions
                  seamlessly.
                </p>
              </div>

              <PaymentTabs />
            </div>
          </div>
        </main>
      </div>
    </Providers>
  );
}
