import { ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';

interface PaymentButtonProps {
    disabled?: boolean;
}
export default function PaymentButton({
    disabled = false,
}: PaymentButtonProps) {
    return (
        <Button
            type='submit'
            className='h-12 w-full text-base font-bold'
            disabled={disabled}>
            Proceed to Payment
            <ShieldCheck />
        </Button>
    );
}
