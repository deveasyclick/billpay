import { Button } from '@/components/ui/button';
import { Tag, X } from 'lucide-react';

interface BannerProps {
    title: string;
    description: string;
}

export default function Banner({ title, description }: BannerProps) {
    return (
        <div className='mt-8 p-5 bg-primary/20 rounded-xl flex items-center justify-between relative'>
            <div className='flex items-center gap-4'>
                <div className='bg-white text-primary p-3 rounded-full hidden sm:flex'>
                    <Tag className='h-5 w-5' />
                </div>
                <div>
                    <h3 className='font-semibold text-primary'>{title}</h3>
                    <p className='text-sm text-gray-700'>{description}</p>
                </div>
            </div>
            <Button
                variant='ghost'
                size='icon'
                className='absolute top-2 right-2 text-gray-500'>
                <X className='h-4 w-4' />
            </Button>
        </div>
    );
}
