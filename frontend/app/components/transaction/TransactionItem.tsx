import { TransactionStatus } from '@/types/transaction';
import { LucideIcon } from 'lucide-react';

interface TransactionItemProps {
    icon: LucideIcon;
    title: string;
    date: string;
    status: TransactionStatus;
    amount: string;
}

export function TransactionItem({
    icon: Icon,
    title,
    date,
    status,
    amount,
}: TransactionItemProps) {
    return (
        <div className='flex items-center gap-4'>
            <div className='bg-primary/20 text-primary w-12 h-12 flex items-center justify-center rounded-lg shrink-0'>
                <Icon className='h-6 w-6' />
            </div>
            <div className='flex-1'>
                <p className='font-medium'>{title}</p>
                <p className='text-sm text-gray-500'>
                    {date} –{' '}
                    <span
                        className={
                            status === 'Successful'
                                ? 'text-green-600'
                                : status === 'Pending'
                                ? 'text-orange-500'
                                : 'text-red-500'
                        }>
                        {status}
                    </span>
                </p>
            </div>
            <p className='font-medium'>{amount}</p>
        </div>
    );
}
