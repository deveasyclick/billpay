import { z } from 'zod';

export const ElectricitySchema = z.object({
    provider: z.string().min(1, 'Select a provider'),
    plan: z.enum(['Prepaid', 'Postpaid']),
    meterNumber: z
        .string()
        .min(10, 'Enter a valid phone number')
        .regex(/^[0-9]+$/, 'Only numbers allowed'),
    amount: z.string().min(1, 'Enter a valid amount'),
});

export type ElectricityFormValues = z.infer<typeof ElectricitySchema>;
