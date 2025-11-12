'use client';

import BillSelectTrigger from '@/components/SelectTrigger';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { TVFormValues } from '../tv.schema';

const bundles = [
    { label: '5 GB', price: '$10.00 / 30 Days', value: '5gb' },
    { label: '10 GB', price: '$18.00 / 30 Days', value: '10gb' },
    { label: '25 GB', price: '$35.00 / 30 Days', value: '25gb' },
    { label: 'Unlimited', price: '$45.00 / 30 Days', value: 'unlimited' },
    { label: 'Other', price: 'Custom', value: 'custom' },
];

interface Props {
    form: UseFormReturn<TVFormValues>;
}

export default function TVBundleSelector({ form }: Props) {
    const [isCustom, setIsCustom] = useState(false);

    const handleSelect = (value: string) => {
        form.setValue('bundle', value);
        if (value === 'custom') {
            setIsCustom(true);
            form.setValue('customBundle', '');
        } else {
            setIsCustom(false);
            form.setValue('customBundle', '');
        }
    };

    return (
        <div className='flex flex-col gap-3'>
            <FormField
                control={form.control}
                name='bundle'
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className='text-gray-800 dark:text-gray-200'>
                            Choose a TV Subscription Bundle
                        </FormLabel>
                        <div className='grid grid-cols-3 gap-3 mt-2'>
                            {bundles.map((bundle) => (
                                <label
                                    key={bundle.value}
                                    className={cn(
                                        'flex cursor-pointer items-center gap-4 rounded-lg border border-solid border-gray-300 dark:border-gray-700 p-4 transition-all',
                                        field.value === bundle.value &&
                                            'border-primary ring-2 ring-primary/20'
                                    )}>
                                    <input
                                        type='radio'
                                        value={bundle.value}
                                        checked={field.value === bundle.value}
                                        onChange={() =>
                                            handleSelect(bundle.value)
                                        }
                                        className='h-5 w-5 border-2 border-gray-300 dark:border-gray-600 bg-transparent text-primary focus:ring-primary focus:ring-offset-0 hidden sm:block'
                                    />
                                    <div className='flex flex-col'>
                                        <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                                            {bundle.label}
                                        </p>
                                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                                            {bundle.price}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Show custom input when 'Other' is selected */}
            {isCustom && (
                <FormField
                    control={form.control}
                    name='customBundle'
                    render={({ field }) => (
                        <FormItem>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}>
                                <FormControl>
                                    <BillSelectTrigger placeholder='Choose network' />
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value='mtn'>MTN</SelectItem>
                                    <SelectItem value='airtel'>
                                        Airtel
                                    </SelectItem>
                                    <SelectItem value='glo'>Glo</SelectItem>
                                    <SelectItem value='9mobile'>
                                        9mobile
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </div>
    );
}
