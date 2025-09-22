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
import { useInterswitchCheckout } from "@/hooks/use-interswitch-checkout";
import { usePayBill } from "@/hooks/usePayBill";
import { useBillingItems } from "@/lib/context/itemContext";
import type { InterSwitchCheckoutResponse } from "@/types/checkout";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRightIcon, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AirtimeFormSchema, type AirtimeForm } from "../airtime.schema";
import { SUPPORTED_CRYPTO, SUPPORTED_NETWORKS } from "../constants";

interface AirtimeTabProps {}

export const AirtimeTab = () => {
  // Airtime form
  const { checkout } = useInterswitchCheckout();
  const form = useForm<AirtimeForm>({
    resolver: zodResolver(AirtimeFormSchema),
    defaultValues: {
      phone: "",
      network: undefined,
      amount: 0.0,
      coin: "USDT",
    },
  });
  const items = useBillingItems();
  const { mutate: payBill, isPending } = usePayBill();

  const onSubmit = (data: AirtimeForm) => {
    const metadata = items.find(
      (item) =>
        item.service === "AIRTIME" &&
        // item.amountType === 0 && this check is not available in test
        item.amount === 20000 &&
        item.providerName.toLowerCase().includes(data.network)
    )?.providerMeta;
    const paymentCode = metadata?.find(
      (meta) => meta.providerName === "interswitch"
    )?.paymentCode;

    if (!paymentCode) {
      console.log("paymentCode not found");
      toast.error("An error occurred. Please try again later.");
      return;
    }

    const handleBillPayment = async (res: InterSwitchCheckoutResponse) => {
      payBill(
        {
          customerId: data.phone,
          amount: data.amount,
          requestReference: res.txnref,
          paymentCode: paymentCode,
        },
        {
          onSuccess(data) {
            console.log("success", data);
            toast.success("Payment successful 🎉");
          },
          onError(error) {
            console.log("error", error);
            toast.error(error.message);
          },
        }
      );
    };

    checkout({
      amount: data.amount,
      customerName: data.phone,
      onComplete: handleBillPayment,
    });
  };
  return (
    <div className="p-8">
      <div className="space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900">Buy Airtime</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
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
                        className="h-12 pl-4 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-md"
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
                <FormItem className="w-full">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Select Biller
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 w-full shadow-md h-12!">
                        <SelectValue placeholder="Select biller..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SUPPORTED_NETWORKS.map((network) => (
                        <SelectItem key={network.id} value={network.id}>
                          <div className="flex items-center space-x-3 w-full">
                            <span>
                              <Image
                                alt={`${network} logo`}
                                src={network.logo}
                                height={25}
                                width={25}
                              />
                            </span>
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

            {/* Divider */}
            <div className="w-full border-b border-gray-200 pb-4"></div>

            <FormField
              control={form.control}
              name="coin"
              render={({ field }) => (
                <FormItem className="w-full flex flex-row">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Pay with:
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-gray-300 p-0">
                        <SelectValue placeholder="Select a coin..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SUPPORTED_CRYPTO.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          <div className="flex items-center space-x-3 w-full">
                            <div className="w-6 h-6 flex items-center justify-center mr-1!">
                              <Image
                                src={c.logo}
                                alt={c.name}
                                width={25}
                                height={25}
                                className="object-contain"
                              />
                            </div>
                            <span className="font-bold">{c.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex w-full bg-gray-100 rounded-lg p-4 z-10 relative">
              <div className="w-1/2 flex flex-row">
                <span>
                  <Image
                    src="/icons/usdt.svg"
                    alt="flag"
                    width={25}
                    height={10}
                    className="object-contain"
                  />
                </span>
                <span className="pl-1 font-medium leading-snug">USDT</span>
              </div>
              <div className="w-1/2">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-2 text-right">
                          <div>
                            <Input
                              type="number"
                              min={100}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                              className="outline-0 bg-transparent focus:ring-0 border-none focus:outline-0 shadow-none focus:shadow-none focus-visible:ring-0 text-4xl! text-right pr-5"
                              value={field.value}
                            />
                            {/* Custom spinner buttons */}
                            <div className="absolute right-2 top-6 bottom-0 flex flex-col">
                              <button
                                type="button"
                                onClick={() =>
                                  field.onChange((field.value || 0) + 100)
                                }
                                className="px-2 text-gray-500 hover:text-black cursor-pointer"
                              >
                                <svg
                                  viewBox="0 0 1024 1024"
                                  version="1.1"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="#000000"
                                  className="w-3 h-3"
                                >
                                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                  <g
                                    id="SVGRepo_tracerCarrier"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  ></g>
                                  <g id="SVGRepo_iconCarrier">
                                    <path
                                      d="M903.232 768l56.768-50.432L512 256l-448 461.568 56.768 50.432L512 364.928z"
                                      fill="#000000"
                                    ></path>
                                  </g>
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    field.value <= 0 ||
                                    field.value - 100 <= 0
                                  ) {
                                    field.onChange(0);
                                    return;
                                  }
                                  field.onChange((field.value || 0) - 100);
                                }}
                                className="px-2 text-gray-500 hover:text-black cursor-pointer"
                              >
                                <span>
                                  <svg
                                    viewBox="0 0 1024 1024"
                                    className="w-3 h-3"
                                    version="1.1"
                                    fill="#000000"
                                  >
                                    <g
                                      id="SVGRepo_bgCarrier"
                                      strokeWidth="0"
                                    ></g>
                                    <g
                                      id="SVGRepo_tracerCarrier"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></g>
                                    <g id="SVGRepo_iconCarrier">
                                      <path
                                        d="M903.232 256l56.768 50.432L512 768 64 306.432 120.768 256 512 659.072z"
                                        fill="#000000"
                                        data-darkreader-inline-fill=""
                                      ></path>
                                    </g>
                                  </svg>
                                </span>
                              </button>
                            </div>
                          </div>
                          <div className="text-gray-500 mt-4 text-xs">
                            Min: $0.02
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="relative top-[-33px] w-4/5 bg-blue-100 text-center mx-auto p-3 pb-0 rounded-b-xl z-30">
              <span className="text-sm font-light">Airtime of</span>
              <ArrowLeftRightIcon className="inline px-1" />
              <span className="font-bold">₦0</span>
            </div>
            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 border-blue-500 text-blue-500 cursor-pointer hover:bg-blue-100 hover:text-blue-500"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-3 h-12 bg-purple-400 hover:bg-purple-500 text-white font-medium cursor-pointer"
                disabled={
                  !form.watch("amount") ||
                  form.watch("amount") < 50 ||
                  isPending
                }
              >
                Proceed to Pay <ShieldCheck />
              </Button>
            </div>
          </form>
        </Form>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-600 bg-blue-100 p-2 rounded-lg">
            Need to keep track of your transactions?{" "}
            <a
              href="#"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign up now →
            </a>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Powered by <span className="text-blue-600">Coinley</span> - Secure
            Cryptocurrency Payments 🔒
          </p>
        </div>
      </div>
    </div>
  );
};
