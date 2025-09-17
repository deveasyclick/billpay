"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AirtimeFormSchema, type AirtimeForm } from "./airtime.schema";

const networks = [
  { id: "mtn", name: "MTN", color: "bg-yellow-500" },
  { id: "glo", name: "GLO", color: "bg-green-500" },
  { id: "airtel", name: "AIRTEL", color: "bg-red-500" },
  { id: "9mobile", name: "ETISALAT", color: "bg-green-600" },
];

export default function AirtimePage() {
  const [activeTab, setActiveTab] = useState("airtime");

  // Airtime form
  const form = useForm<AirtimeForm>({
    resolver: zodResolver(AirtimeFormSchema),
    defaultValues: { phone: "", network: undefined, amount: 0 },
  });

  const onSubmitAirtime = (data: AirtimeForm) => {};

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Tab Navigation */}
        <div className="border-b border-gray-100">
          <div className="grid w-full grid-cols-2">
            <button
              onClick={() => setActiveTab("airtime")}
              className={`py-4 font-medium transition-colors ${
                activeTab === "airtime"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Airtime
            </button>
            <button
              onClick={() => setActiveTab("data")}
              className={`py-4 font-medium transition-colors ${
                activeTab === "data"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Data
            </button>
          </div>
        </div>

        {/* Airtime Tab Content */}
        {activeTab === "airtime" && (
          <div className="p-8">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Buy Airtime
                </h1>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitAirtime)}
                  className="space-y-6"
                >
                  {/* Phone Number */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="What's your phone number?"
                              {...field}
                              className="h-12 pl-4 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Network Selection */}
                  <FormField
                    control={form.control}
                    name="network"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Select Biller
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select biller..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {networks.map((network) => (
                              <SelectItem key={network.id} value={network.id}>
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-6 h-6 ${network.color} rounded-full flex items-center justify-center`}
                                  >
                                    <span className="text-white text-xs font-bold">
                                      {network.name.charAt(0)}
                                    </span>
                                  </div>
                                  <span>{network.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Amount */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Amount
                        </FormLabel>
                        <FormControl>
                          <div className="text-center space-y-2">
                            <div className="text-4xl font-light text-gray-900">
                              {field.value || "0.00"}
                            </div>
                            <p className="text-sm text-gray-500">
                              Amount will be billed in Naira
                            </p>
                            <Input
                              type="number"
                              min={50}
                              {...field}
                              className="hidden"
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                            <div className="grid grid-cols-3 gap-3 mt-4">
                              {[100, 200, 500, 1000, 2000, 5000].map(
                                (amount) => (
                                  <Button
                                    key={amount}
                                    type="button"
                                    variant="outline"
                                    onClick={() => field.onChange(amount)}
                                    className="h-10 text-sm border-gray-200 hover:border-blue-500 hover:text-blue-600"
                                  >
                                    ₦{amount}
                                  </Button>
                                )
                              )}
                            </div>
                            <Input
                              type="number"
                              placeholder="Enter custom amount"
                              min={50}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                              className="h-12 text-center border-gray-200 focus:border-blue-500 focus:ring-blue-500 mt-4"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-12 border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                      disabled={
                        !form.watch("amount") || form.watch("amount") < 50
                      }
                    >
                      Proceed to Pay ₦{form.watch("amount") || 0}
                    </Button>
                  </div>
                </form>
              </Form>

              {/* Footer */}
              <div className="text-center pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Need to keep track of your transactions?{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign up now →
                  </a>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Powered by <span className="text-blue-600">Coinley</span> -
                  Secure Cryptocurrency Payments 🔒
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Data Tab Content */}
        {activeTab === "data" && (
          <div className="p-8">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Buy Data</h1>
              </div>

              {/* Data form would go here - same structure as airtime */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Phone Number
                  </label>
                  <Input
                    placeholder="What's your phone number?"
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Select Biller
                  </label>
                  <Select>
                    <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select biller..." />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 text-sm text-blue-600 font-medium">
                        Select which biller
                      </div>
                      {networks.map((network) => (
                        <SelectItem key={network.id} value={network.id}>
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-6 h-6 ${network.color} rounded-full flex items-center justify-center`}
                            >
                              <span className="text-white text-xs font-bold">
                                {network.name.charAt(0)}
                              </span>
                            </div>
                            <span>{network.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                    Proceed to Pay ₦
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Need to keep track of your transactions?{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign up now →
                  </a>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Powered by <span className="text-blue-600">Coinley</span> -
                  Secure Cryptocurrency Payments 🔒
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
