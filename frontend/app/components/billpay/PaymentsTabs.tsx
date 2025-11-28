"use client";

import { AirtimeTab, ElectricityTab } from "@/components/billpay";
import DataTab from "@/components/billpay/data";
import TVTab from "@/components/billpay/TV";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Phone, Tv, Wifi } from "lucide-react";

const tabs = [
  { value: "airtime", label: "Airtime", icon: Phone },
  { value: "data", label: "Data", icon: Wifi },
  { value: "electricity", label: "Electricity", icon: Lightbulb },
  { value: "tv", label: "TV", icon: Tv },
];
export default function PaymentTabs() {
  return (
    <Card className="bg-white dark:bg-gray-900/50 border-0 shadow-none md:shadow-sm">
      <CardContent className="border-b border-gray-200 dark:border-gray-700 pb-4 px-2 md:px-6">
        <Tabs defaultValue="airtime" className="w-full gap-6">
          <TabsList className="flex w-full overflow-x-auto no-scrollbarborder-b border-gray-200 dark:border-gray-700 bg-transparent p-0 gap-2 sm:gap-6">
            {tabs.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-2 px-2 sm:px-3 py-2 text-sm border-0 border-b-2 border-transparent text-gray-500 dark:text-gray-400 transition-colors duration-150 ease-in-out hover:text-blue-600 data-[state=active]:text-blue-600 data-[state=active]:border-blue-600 data-[state=active]:shadow-none data-[state=active]:rounded-none cursor-pointer"
              >
                <Icon className="w-4 h-4 shrink-0 hidden sm:block" />
                <span>{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="airtime">
            <AirtimeTab />
          </TabsContent>
          <TabsContent value="data">
            <DataTab />
          </TabsContent>
          <TabsContent value="electricity">
            <ElectricityTab />
          </TabsContent>
          <TabsContent value="tv">
            <TVTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
