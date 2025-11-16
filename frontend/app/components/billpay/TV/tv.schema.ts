import { z } from "zod";

export const TVSchema = z.object({
  smartCardNumber: z.string().min(5, "Invalid Card Number"),
  provider: z.string().min(1, "Please select a provider"),
  package: z.string().min(1, "Please select a package"),
});

export type TVFormValues = z.infer<typeof TVSchema>;
