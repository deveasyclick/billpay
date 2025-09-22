"use client";

import { Tabs } from "@/components/tab";
import { AirtimeTab, DataTab } from "./tabs";

export default function AirtimeOrDataPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Tabs
        defaultTab="airtime"
        activeClassName="text-blue-600 bg-blue-100 z-10"
        items={[
          {
            key: "airtime",
            label: "Airtime",
            content: <AirtimeTab />,
            className: "bg-gray-100",
          },
          {
            key: "data",
            label: "Data",
            content: <DataTab />,
            className: "bg-gray-100 relative left-[-20px] z-0",
          },
        ]}
      />
    </div>
  );
}
