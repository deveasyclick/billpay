"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabItem = {
  key: string;
  label: string;
  className?: string;
  content: React.ReactNode;
};

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
  activeClassName?: string;
}

export function Tabs({
  items,
  defaultTab,
  className,
  activeClassName,
}: TabsProps) {
  const [active, setActive] = React.useState(defaultTab ?? items[0]?.key);

  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-gray-100",
        className
      )}
    >
      {/* Tab Navigation */}
      <div className="border-b border-gray-100">
        <div className="grid grid-cols-2 w-9/10 mx-auto mt-4 relative">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={cn(
                "font-medium transition-colors rounded-2xl py-2 text-gray-600 cursor-pointer",
                item.className ?? "",
                active === item.key && (activeClassName ?? "")
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Tab Content */}
      <div>{items.find((i) => i.key === active)?.content}</div>
    </div>
  );
}
