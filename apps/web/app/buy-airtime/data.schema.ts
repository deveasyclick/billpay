import { z } from "zod";

export enum Coin {
  USDT = "USDT",
  USDC = "USDC",
  BUSD = "BUSD",
  DAI = "DAI",
}

export const DataFormSchema = z.object({
  phone: z
    .string()
    .regex(/^(?:0\d{10}|\+?[1-9]\d{7,14})$/, "Enter a valid phone number")
    .transform((val) => {
      // If it's Nigerian local (starts with 0 and 11 digits), normalize to +234
      if (/^0\d{10}$/.test(val)) {
        return "+234" + val.slice(1);
      }
      // If already has +, keep it
      if (val.startsWith("+")) {
        return val;
      }
      // Otherwise, just prefix +
      return "+" + val;
    }),

  network: z
    .enum(["mtn", "glo", "airtel", "9mobile"])
    .refine((val) => !!val, { message: "Network is required" }),

  coin: z.enum(["USDT", "USDC", "BUSD", "DAI"]),

  planId: z.string(),
});

export type DataForm = z.infer<typeof DataFormSchema>;
