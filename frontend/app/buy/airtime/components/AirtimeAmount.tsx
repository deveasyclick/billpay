import BillInput from '@/components/Input';
import { Button } from '@/components/ui/button';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';
import { AirtimeFormValues } from '../airtime.schema';

interface Props {
    form: UseFormReturn<AirtimeFormValues>;
    selectedAmount: string;
    setSelectedAmount: (val: string) => void;
    isCustom: boolean;
    setIsCustom: (val: boolean) => void;
}

export default function AirtimeAmount({
    form,
    selectedAmount,
    setSelectedAmount,
    isCustom,
    setIsCustom,
}: Props) {
    const handleAmountSelect = (value: string) => {
        if (value === 'other') {
            setIsCustom(true);
            form.setValue('amount', '');
        } else {
            setIsCustom(false);
            setSelectedAmount(value);
            form.setValue('amount', value);
        }
    };

    return (
        <div className='space-y-2'>
            <FormLabel className='text-gray-800 dark:text-gray-200'>
                Amount
            </FormLabel>
            <div className='flex flex-wrap gap-3'>
                {['50', '100', '200', 'other'].map((value) => (
                    <Button
                        key={value}
                        type='button'
                        onClick={() => handleAmountSelect(value)}
                        variant='outline'
                        className={cn(
                            'h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
                            selectedAmount === value &&
                                !isCustom &&
                                'border-primary border-2'
                        )}>
                        {value === 'other' ? 'Other' : `₦${value}`}
                    </Button>
                ))}
            </div>

            <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <div className='relative'>
                                <BillInput
                                    {...field}
                                    type='number'
                                    placeholder='Enter amount'
                                    disabled={!isCustom}
                                    className={cn(field.value && 'pl-6')}
                                />
                                <span
                                    className={cn(
                                        'absolute top-2.5 left-2 opacity-40 hidden',
                                        field.value && 'inline'
                                    )}>
                                    ₦
                                </span>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
