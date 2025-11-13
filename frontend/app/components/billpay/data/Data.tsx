'use client';

import PaymentButton from '@/components/buttons/PaymentButton';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import DataBundleSelector from './components/DataBundleSelector';
import { DataFormValues, DataSchema } from './data.schema';
import NetworkAndPhone from '@/components/billpay/NetworkAndPhone';

export default function DataTab() {
    const form = useForm<DataFormValues>({
        resolver: zodResolver(DataSchema),
        defaultValues: {
            network: 'mtn',
            bundle: '',
            phone: '',
        },
        mode: 'onChange',
    });

    const onSubmit = (data: DataFormValues) => {
        console.log('Data form submitted:', data);
    };
    const selectedNetwork = form.watch('network');
    return (
        <div className='w-full max-w-lg bg-white dark:bg-gray-900'>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-8'>
                    <NetworkAndPhone form={form} />
                    {/* Show bundle options only when network is chosen */}
                    {selectedNetwork && <DataBundleSelector form={form} />}

                    <PaymentButton disabled={!form.formState.isValid} />
                </form>
            </Form>
        </div>
    );
}
