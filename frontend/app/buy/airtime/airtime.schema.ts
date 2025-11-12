import { networkProviders } from '@/types/NetworkProviders';
import { z } from 'zod';

export const AirtimeSchema = z.object({
    network: z.enum(networkProviders),
    phone: z
        .string()
        .min(10, 'Enter a valid phone number')
        .regex(/^[0-9]+$/, 'Only numbers allowed'),
    amount: z.string().min(1, 'Enter a valid amount'),
});

export type AirtimeFormValues = z.infer<typeof AirtimeSchema>;
