import { Card, CardContent } from '@/components/ui/card';

interface BillCardProps {
    title: string;
    description: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}
export default function BillCard({
    title,
    description,
    icon: Icon,
}: BillCardProps) {
    return (
        <Card key={title} className='hover:shadow-md transition'>
            <CardContent className='p-4 flex flex-col gap-3'>
                <div className='bg-primary/20 text-primary w-12 h-12 flex items-center justify-center rounded-lg'>
                    <Icon className='h-6 w-6' />
                </div>
                <div>
                    <p className='font-semibold'>{title}</p>
                    <p className='text-sm text-gray-500'>{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}
