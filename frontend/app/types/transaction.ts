import { LucideIcon } from 'lucide-react';

export type TransactionStatus = 'Successful' | 'Pending' | 'Failed';

export type Transaction = {
    icon: LucideIcon;
    title: string;
    date: string;
    status: TransactionStatus;
    amount: string;
};
