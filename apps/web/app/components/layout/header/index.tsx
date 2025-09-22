"use client";

import { Button } from "@/components/ui/button";
import { Fingerprint, PlusCircle, SmartphoneCharging } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [activeTab, setActiveTab] = useState("airtime");
  const navs = [
    { name: "dashboard", href: "/dashboard", title: "Dashboard" },
    { name: "airtime", href: "/buy-airtime", title: "Buy Airtime & Data" },
    { name: "pay", href: "/pay-bills", title: "Pay Bills" },
    { name: "invite", href: "/invite", title: "Invite Friend" },
  ];
  return (
    <header className="bg-white border-gray-100 px-4 py-3">
      <nav className="w-5/7 mx-auto flex items-center justify-between self-center justify-self-center p-2 border-2 border-gray-100 rounded-4xl">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex justify-center">
            <SmartphoneCharging className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">ELITES AFRICA</span>
        </div>

        {/* Navigation Items */}
        <div className="hidden md:flex items-center space-x-4">
          {navs.map((nav) => (
            <a
              key={nav.name}
              href={nav.href}
              onClick={() => setActiveTab(nav.name)}
              className={`py-2 px-5 rounded-3xl border-1 border-gray-300 items-center text-gray-500 transition-colors text-sm font-medium hover:bg-blue-600 hover:text-white ${
                activeTab === nav.name && "bg-blue-600 text-white"
              }`}
            >
              <span>{nav.title}</span>
            </a>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 border-2 border-gray-100 rounded-2xl px-6 py-4 cursor-pointer"
          >
            <Fingerprint className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            className="hover:bg-blue-600 border-2 border-gray-200 rounded-2xl bg-transparent text-blue-500 p-4 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Sign Up
          </Button>
        </div>
      </nav>
    </header>
  );
}
