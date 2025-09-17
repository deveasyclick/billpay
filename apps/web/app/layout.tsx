import type { Metadata } from "next";
import Header from "./components/layout/header";
import "./globals.css";

export const metadata: Metadata = {
  title: "POC",
  description: "Billing App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="w-full">{children}</main>
      </body>
    </html>
  );
}
