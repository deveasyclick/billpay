import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
    return (
        <header className='flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-background px-6 lg:px-10 py-4 shadow-sm'>
            {/* Left: Logo */}
            <div className='flex items-center gap-3 text-gray-900 dark:text-white'>
                <div className='text-blue-600'>
                    <svg
                        fill='none'
                        viewBox='0 0 48 48'
                        xmlns='http://www.w3.org/2000/svg'
                        className='size-6'>
                        <path
                            clipRule='evenodd'
                            fill='currentColor'
                            fillRule='evenodd'
                            d='M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z'
                        />
                    </svg>
                </div>
                <h2 className='text-xl font-bold'>BillPay</h2>
            </div>

            {/* Middle: Nav Links */}
            <nav className='hidden md:flex flex-1 justify-center gap-8'>
                {['Dashboard', 'Transactions', 'Beneficiaries', 'Support'].map(
                    (link) => (
                        <a
                            key={link}
                            className='text-gray-500 dark:text-gray-400 hover:text-blue-600 text-sm font-medium transition-colors'
                            href='#'>
                            {link}
                        </a>
                    )
                )}
            </nav>

            {/* Right: Actions */}
            <div className='flex items-center gap-4'>
                <Button
                    variant='ghost'
                    size='icon'
                    className='rounded-full bg-gray-100 dark:bg-gray-800'>
                    <Bell className='w-5 h-5' />
                </Button>
                <div
                    className='bg-center bg-cover rounded-full size-10'
                    style={{
                        backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCPDoFsQaZQMefPnx39AFHKArWbhGVtMywE7LSeZGHysbrELQRQ2pTPDk7U2SalCK30bUQfkTNRhLxCT1w-RxHu0rsPY_-hhz76N8JsK6JHSzPgR-TghQDx95rM_-1_R9hYTpwNTHwewkHVUY9Utp2wUIep1c0JiD-7WK5pD5K0O0Rfc8lGT1vVVhLDhXm5pKJ__8OtDmPaidqw3UEkkVcFV6YdxnDDab53XZAa8Qi_TDEmU-6YJEGCrfoCgTPy2YUKew5mJLmBFFAH')",
                    }}
                />
            </div>
        </header>
    );
}
