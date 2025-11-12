'use client';

import PaymentButton from '@/components/buttons/PaymentButton';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import TVBundleSelector from './components/TvBundleSelector';
import TVBundle from './components/TvBundle';
import { TVFormValues, TVSchema } from './tv.schema';
import BillInput from '@/components/Input';

export default function TVTab() {
    const form = useForm<TVFormValues>({
        resolver: zodResolver(TVSchema),
        defaultValues: {
            provider: '',
            bundle: '',
            smartCardNumber: '',
        },
        mode: 'onChange',
    });

    const onSubmit = (tv: TVFormValues) => {
        console.log('TV form submitted:', tv);
    };
    return (
        <div className='w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm'>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-8'>
                    <TVBundle form={form} />{' '}
                    <FormField
                        control={form.control}
                        name='smartCardNumber'
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <FormLabel className='text-gray-800 dark:text-gray-200'>
                                    Smart Card Number
                                </FormLabel>
                                <FormControl>
                                    <BillInput
                                        {...field}
                                        placeholder='Enter smart card number'
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <PaymentButton disabled={!form.formState.isValid} />
                </form>
            </Form>
        </div>
    );
}
