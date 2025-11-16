import { networkProviders } from "@/types/NetworkProviders";
import { z } from "zod";

export const DataSchema = z.object({
  network: z.enum(networkProviders),
  bundle: z.string().min(1, "Select a data bundle"),
  phone: z
    .string()
    .min(11, "Enter a valid phone number")
    .regex(/^[0-9]+$/, "Only digits allowed"),
});

export type DataFormValues = z.infer<typeof DataSchema>;
