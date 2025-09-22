import type { Metadata } from "next";
import Header from "./components/layout/header";
import "./globals.css";
import { env } from "./lib/env";
import Script from "next/script";
import { Toaster } from "./components/ui/sonner";
import { getBillingItems } from "./lib/api/billing-items";
import { BillingItemProvider } from "./lib/context/itemContext";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Elite Africa",
  description: "Billing App",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const items = await getBillingItems();
  return (
    <html lang="en">
      <body>
        <Header />
        <BillingItemProvider value={items.data ?? []}>
          <Providers>
            <main className="w-full">{children}</main>
          </Providers>
        </BillingItemProvider>

        <Script
          src={env.interswitchInlineUrl}
          strategy="afterInteractive" // ensures it loads after hydration
        />
        <Toaster duration={5000} richColors position="top-center" />
      </body>
    </html>
  );
}
