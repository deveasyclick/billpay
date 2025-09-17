import { Button } from "@/components/ui/button";
import { LogIn, SmartphoneCharging, UserPlus } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <SmartphoneCharging className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-blue-600">ELITEAFRICA</span>
        </div>

        {/* Navigation Items */}
        <div className="hidden md:flex items-center space-x-8">
          <a
            href="/dashboard"
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
          >
            <span>Dashboard</span>
          </a>
          <a
            href="/buy-airtime"
            className="flex items-center space-x-2 text-blue-600 font-medium text-sm"
          >
            <span>Buy Airtime & Data</span>
          </a>
          <a
            href="/pay-bills"
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
          >
            <span>Pay Bills</span>
          </a>
          <a
            href="/invite"
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
          >
            <span>Invite Friend</span>
          </a>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Login
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Sign Up
          </Button>
        </div>
      </nav>
    </header>
  );
}
