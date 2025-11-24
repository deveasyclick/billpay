import "./globals.css";
import { Manrope } from "next/font/google";
import type { Metadata } from "next";
import Providers from "./providers";
import { Toaster } from "sonner";
import { getBillingItems } from "./api/get-billing-items";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Billpay Dashboard",
  description: "Pay bills and purchase services instantly",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: items } = await getBillingItems();

  return (
    <html lang="en" className="light">
      <body
        className={`${manrope.className} bg-background-light text-[#172B4D]`}
      >
        <Providers items={items}>{children}</Providers>
        <Toaster duration={5000} richColors position="top-center" />
      </body>
    </html>
  );
}
