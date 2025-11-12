import { SelectValue, SelectTrigger } from './ui/select';

interface BillSelectTriggerProps {
    className?: string;
    placeholder: string;
}

export default function BillSelectTrigger({
    placeholder,
}: BillSelectTriggerProps) {
    return (
        <SelectTrigger className='border-gray-200 focus:border-blue-500 focus:ring-blue-500 w-full h-11! cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500'>
            <SelectValue placeholder={placeholder} />
        </SelectTrigger>
    );
}
