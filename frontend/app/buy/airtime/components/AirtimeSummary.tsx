interface Props {
    phone: string;
    amount: string;
}

export default function AirtimeSummary({ phone, amount }: Props) {
    return (
        <div className='text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg'>
            {phone && amount ? (
                <p>
                    You are sending
                    <span className='font-bold text-gray-800 dark:text-gray-200 mx-1'>
                        ₦{amount}
                    </span>{' '}
                    to
                    <span className='font-bold text-gray-800 dark:text-gray-200 ml-1'>
                        {phone}
                    </span>
                </p>
            ) : (
                <p>Enter details to preview transaction</p>
            )}
        </div>
    );
}
