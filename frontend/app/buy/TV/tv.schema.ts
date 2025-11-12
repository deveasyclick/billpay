import { z } from 'zod';

export const TVSchema = z.object({
    bundle: z.string().min(1, 'Select a TV subscription bundle'),
    customBundle: z.string().optional(),
    smartCardNumber: z.string().min(5, 'Invalid Card Number'),
    provider: z.string().min(1, 'Please select a provider'),
    package: z.string().min(1, 'Please select a package'),
    amount: z.number().min(100, 'Amount must be greater than 100'),
});

export type TVFormValues = z.infer<typeof TVSchema>;
