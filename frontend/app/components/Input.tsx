import { cn } from '@/lib/utils';
import { Input } from './ui/input';

function BillInput({
    type,
    placeholder,
    className,
    ...props
}: React.ComponentProps<'input'>) {
    return (
        <Input
            type={type}
            placeholder={placeholder}
            {...props}
            className={cn(
                'flex py-[13px] px-[14.82px] gap-[7.412px] self-stretch flex-col  rounded-lg focus-visible:ring-blue-500 focus-visible:ring-2  outline-0 h-11 focus-visible:border-transparent placeholder:text-xs md:placeholder:text-sm text-[#4E515880]',
                className ?? ''
            )}
        />
    );
}

export default BillInput;
