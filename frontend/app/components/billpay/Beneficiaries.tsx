import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Beneficiaries() {
    const beneficiaries = [
        {
            initials: 'DA',
            name: 'Dad Airtel',
            type: 'Airtime',
            color: 'bg-blue-100 text-blue-800',
        },
        {
            initials: 'LW',
            name: 'LIGHT-WATCH',
            type: 'Electricity',
            color: 'bg-green-100 text-green-800',
        },
        {
            initials: 'GT',
            name: 'GOtv Home',
            type: 'TV',
            color: 'bg-purple-100 text-purple-800',
        },
    ];

    return (
        <Card className='bg-white dark:bg-gray-900/50 border-0 shadow-sm'>
            <CardHeader className='flex justify-between items-center'>
                <CardTitle className='text-lg font-bold'>
                    Saved Beneficiaries
                </CardTitle>
                <a className='text-sm text-blue-600 font-medium hover:underline'>
                    Manage
                </a>
            </CardHeader>

            <CardContent>
                <ul className='space-y-3'>
                    {beneficiaries.map((b, i) => (
                        <li
                            key={i}
                            className='flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50'>
                            <div className='flex items-center gap-3'>
                                <div
                                    className={`flex items-center justify-center size-9 rounded-full ${b.color}`}>
                                    <span className='text-sm font-bold'>
                                        {b.initials}
                                    </span>
                                </div>
                                <div>
                                    <p className='font-medium text-gray-800 dark:text-gray-200'>
                                        {b.name}
                                    </p>
                                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                                        {b.type}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant='link'
                                className='text-blue-600 text-sm font-bold hover:underline'>
                                Pay
                            </Button>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
