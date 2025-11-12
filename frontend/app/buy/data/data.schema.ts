import { networkProviders } from '@/types/NetworkProviders';
import { z } from 'zod';

export const DataSchema = z.object({
    network: z.enum(networkProviders),
    bundle: z.string().min(1, 'Select a data bundle'),
    customBundle: z.string().optional(),
    phone: z
        .string()
        .min(10, 'Enter a valid phone number')
        .regex(/^[0-9]+$/, 'Only digits allowed'),
});

export type DataFormValues = z.infer<typeof DataSchema>;
