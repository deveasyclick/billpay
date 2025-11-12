'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import BillInput from '@/components/Input';
import BillSelectTrigger from '@/components/SelectTrigger';
import PaymentButton from '@/components/buttons/PaymentButton';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';
import ElectricityAmount from './components/ElectricityAmount';
import ElectricitySummary from './components/ElectricitySummary';
import { ElectricityFormValues, ElectricitySchema } from './electricity.schema';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const networks = ['mtn', 'airtel', 'glo', '9mobile'];
export default function Electricity() {
    const [selectedAmount, setSelectedAmount] = useState<string>('');
    const [isCustom, setIsCustom] = useState<boolean>(false);

    const form = useForm<ElectricityFormValues>({
        resolver: zodResolver(ElectricitySchema),
        defaultValues: {
            provider: '',
            meterNumber: '',
            amount: '',
            plan: 'Prepaid',
        },
    });

    const onSubmit = (data: ElectricityFormValues) => {
        console.log('Electricity form:', data);
    };

    const meterNumber = form.watch('meterNumber');
    const amount = form.watch('amount');

    return (
        <div className='w-full max-w-lg bg-white dark:bg-gray-900'>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-6'>
                    <FormField
                        control={form.control}
                        name='plan'
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <FormLabel className='text-sm font-medium text-gray-700'>
                                    Select a Plan
                                </FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}>
                                        <div className='flex items-start gap-1.5 self-stretch w-full'>
                                            <Label
                                                htmlFor='r1'
                                                onClick={() =>
                                                    field.onChange('Prepaid')
                                                }
                                                className={cn(
                                                    'flex p-3 items-center gap-[7.412px] self-stretch border-[0.741px] border-[#E5E5E5] rounded-[11.859px] shadow-right-bottom w-1/2 cursor-pointer',
                                                    field.value === 'Prepaid' &&
                                                        'border-[#2563EB] border'
                                                )}>
                                                <RadioGroupItem
                                                    value='Prepaid'
                                                    id='r1'
                                                    className='data-[state=checked]:bg-blue-500 [&_svg]:fill-white'
                                                />
                                                <span>Prepaid</span>
                                            </Label>
                                            <Label
                                                htmlFor='r2'
                                                className={cn(
                                                    'flex p-3 items-center gap-[7.412px] self-stretch border-[0.741px] border-[#E5E5E5] rounded-[11.859px] shadow-right-bottom w-1/2 cursor-pointer',
                                                    field.value ===
                                                        'Postpaid' &&
                                                        'border-[#2563EB] border'
                                                )}>
                                                <RadioGroupItem
                                                    value='Postpaid'
                                                    id='r2'
                                                    className='data-[state=checked]:bg-blue-500 [&_svg]:fill-white'
                                                />
                                                <span>Postpaid</span>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='provider'
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <FormLabel className='text-gray-800 dark:text-gray-200'>
                                    Select Provider
                                </FormLabel>
                                <Select
                                    onValueChange={(value) =>
                                        field.onChange(value)
                                    }
                                    defaultValue={field.value}>
                                    <FormControl>
                                        <BillSelectTrigger placeholder='Choose provider' />
                                    </FormControl>
                                    <SelectContent>
                                        {networks.map((network) => (
                                            <SelectItem
                                                key={network}
                                                value={network}>
                                                {network.toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='meterNumber'
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <FormLabel className='text-gray-800 dark:text-gray-200'>
                                    Meter Number
                                </FormLabel>
                                <FormControl>
                                    <BillInput
                                        {...field}
                                        placeholder="Enter meter's number"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Amount */}
                    <ElectricityAmount
                        form={form}
                        selectedAmount={selectedAmount}
                        setSelectedAmount={setSelectedAmount}
                        isCustom={isCustom}
                        setIsCustom={setIsCustom}
                    />

                    {/* Summary */}
                    <ElectricitySummary
                        meterNumber={meterNumber}
                        amount={amount}
                    />

                    {/* Submit */}
                    <PaymentButton disabled={!form.formState.isValid} />
                </form>
            </Form>
        </div>
    );
}
