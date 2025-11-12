'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import NetworkAndPhone from '@/components/billpay/NetworkAndPhone';
import PaymentButton from '@/components/buttons/PaymentButton';
import { Form } from '@/components/ui/form';
import { AirtimeFormValues, AirtimeSchema } from './airtime.schema';
import AirtimeAmount from './components/AirtimeAmount';
import AirtimeSummary from './components/AirtimeSummary';

export default function Airtime() {
    const [selectedAmount, setSelectedAmount] = useState<string>('');
    const [isCustom, setIsCustom] = useState<boolean>(false);

    const form = useForm<AirtimeFormValues>({
        resolver: zodResolver(AirtimeSchema),
        defaultValues: {
            network: 'mtn',
            phone: '',
            amount: '',
        },
    });

    const onSubmit = (data: AirtimeFormValues) => {
        console.log('Airtime form:', data);
    };

    const phone = form.watch('phone');
    const amount = form.watch('amount');

    return (
        <div className='w-full max-w-lg bg-white dark:bg-gray-900'>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-6'>
                    {/* Network & Phone row */}
                    <NetworkAndPhone form={form} />

                    {/* Amount */}
                    <AirtimeAmount
                        form={form}
                        selectedAmount={selectedAmount}
                        setSelectedAmount={setSelectedAmount}
                        isCustom={isCustom}
                        setIsCustom={setIsCustom}
                    />

                    {/* Summary */}
                    <AirtimeSummary phone={phone} amount={amount} />

                    {/* Submit */}
                    <PaymentButton disabled={!form.formState.isValid} />
                </form>
            </Form>
        </div>
    );
}
