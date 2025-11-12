import TransactionHistory from './TransactionHistory';
import Beneficiaries from './Beneficiaries';

export default function Sidebar() {
    return (
        <aside className='space-y-8'>
            <TransactionHistory />
            <Beneficiaries />
        </aside>
    );
}
