import { validateCustomer } from '@/api/validate-customer';
import { useMutation } from '@tanstack/react-query';

export function useValidateCustomer() {
    return useMutation({
        mutationFn: validateCustomer,
    });
}
