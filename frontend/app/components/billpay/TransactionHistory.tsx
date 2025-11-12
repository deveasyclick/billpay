import { Wifi, Tv, Lightbulb } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function TransactionHistory() {
    const history = [
        {
            icon: <Wifi className='w-5 h-5' />,
            title: 'MTN 2.5GB Data',
            ref: '08012345678',
            amount: '-₦500',
            status: 'Successful',
            color: 'text-green-600',
        },
        {
            icon: <Tv className='w-5 h-5' />,
            title: 'DSTV Compact',
            ref: '1234567890',
            amount: '-₦9,000',
            status: 'Successful',
            color: 'text-green-600',
        },
        {
            icon: <Lightbulb className='w-5 h-5' />,
            title: 'Ikeja Electric',
            ref: '04123456789',
            amount: '-₦5,000',
            status: 'Pending',
            color: 'text-orange-500',
        },
    ];

    return (
        <Card className='bg-white dark:bg-gray-900/50 border-0 shadow-sm'>
            <CardHeader className='flex justify-between items-center'>
                <CardTitle className='text-lg font-bold'>
                    Transaction History
                </CardTitle>
                <a className='text-sm text-blue-600 font-medium hover:underline'>
                    View all
                </a>
            </CardHeader>

            <CardContent>
                <ul className='space-y-4'>
                    {history.map((item, i) => (
                        <li key={i} className='flex items-center gap-4'>
                            <div className='flex items-center justify-center size-10 rounded-full bg-blue-100 text-blue-600'>
                                {item.icon}
                            </div>
                            <div className='flex-1'>
                                <p className='font-semibold text-gray-800 dark:text-gray-200'>
                                    {item.title}
                                </p>
                                <p className='text-sm text-gray-500 dark:text-gray-400'>
                                    {item.ref}
                                </p>
                            </div>
                            <div className='text-right'>
                                <p className='font-bold text-gray-800 dark:text-gray-200'>
                                    {item.amount}
                                </p>
                                <p className={`text-xs ${item.color}`}>
                                    {item.status}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
