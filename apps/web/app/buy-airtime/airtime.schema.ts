//app/buy-airtime/airtime.schema.ts

// import { z } from "zod";

// export enum NetworkProvider {
//   MTN = "mtn",
//   GLO = "glo",
//   AIRTEL = "airtel",
//   NINEMOBILE = "9mobile",
// }

// export const AirtimeFormSchema = z.object({
//   phone: z
//     .string()
//     .regex(/^(?:0\d{10}|\+?[1-9]\d{7,14})$/, "Enter a valid phone number")
//     .transform((val) => {
//       // If it's Nigerian local (starts with 0 and 11 digits), normalize to +234
//       if (/^0\d{10}$/.test(val)) {
//         return "+234" + val.slice(1);
//       }
//       // If already has +, keep it
//       if (val.startsWith("+")) {
//         return val;
//       }
//       // Otherwise, just prefix +
//       return "+" + val;
//     }),

//   network: z
//     .enum(["mtn", "glo", "airtel", "9mobile"])
//     .refine((val) => !!val, { message: "Network is required" }),

//   amount: z.transform(Number).pipe(z.number().min(50)),
// });

// export const PaymentFormSchema = z.object({
//   cardNumber: z
//     .string()
//     .regex(/^\d{13,19}$/, "Card number must be 13 to 19 digits"),
//   expiry: z
//     .string()
//     .regex(
//       /^(0[1-9]|1[0-2])\/\d{2}$/,
//       "Expiry must be in MM/YY format with a valid month"
//     ),
//   cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
// });

// export type AirtimeForm = z.infer<typeof AirtimeFormSchema>;
// export type PaymentForm = z.infer<typeof PaymentFormSchema>;




//app/buy-airtime/airtime.schema.ts
import { z } from "zod";

export enum NetworkProvider {
  MTN = "mtn",
  GLO = "glo",
  AIRTEL = "airtel",
  NINEMOBILE = "9mobile",
}

export const AirtimeFormSchema = z.object({
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

  amount: z.transform(Number).pipe(z.number().min(50)),
});

export const PaymentFormSchema = z.object({
  cardNumber: z
    .string()
    .regex(/^\d{13,19}$/, "Card number must be 13 to 19 digits"),
  expiry: z
    .string()
    .regex(
      /^(0[1-9]|1[0-2])\/\d{2}$/,
      "Expiry must be in MM/YY format with a valid month"
    ),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
});

export type AirtimeForm = z.infer<typeof AirtimeFormSchema>;
export type PaymentForm = z.infer<typeof PaymentFormSchema>;