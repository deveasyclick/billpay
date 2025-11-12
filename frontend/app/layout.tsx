import './globals.css';
import { Manrope } from 'next/font/google';
import type { Metadata } from 'next';

const manrope = Manrope({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
    title: 'Billpay Dashboard',
    description: 'Pay bills and purchase services instantly',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang='en' className='light'>
            <body
                className={`${manrope.className} bg-background-light text-[#172B4D]`}>
                {children}
            </body>
        </html>
    );
}
