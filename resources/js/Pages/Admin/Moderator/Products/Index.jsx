import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/Admin/Badge';
import Button from '@/Components/Admin/Button';
import Card from '@/Components/Admin/Card';
import Table from '@/Components/Admin/Table';
import TextField from '@/Components/Admin/TextField';
import { formatMoneyPHP } from '@/mock/adminData';
import { useProductsList } from '@/hooks/products/useProductsList';
import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function ModeratorProductsIndex() {
    const [query, setQuery] = useState('');
    const { rows: products } = useProductsList();

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return products.filter((p) => {
            const matchesQ =
                !q ||
                String(p.title || '').toLowerCase().includes(q) ||
                String(p.id || '').toLowerCase().includes(q) ||
                String(p.type || '').toLowerCase().includes(q) ||
                String(p.category || '').toLowerCase().includes(q);
            return matchesQ;
        });
    }, [query, products]);

    const columns = [
        {
            key: 'title',
            header: 'Product',
            render: (p) => (
                <div>
                    <div className="text-sm font-medium text-slate-900">{p.title}</div>
                    <div className="text-xs text-slate-500">{p.id}</div>
                </div>
            ),
        },
        { key: 'type', header: 'Type', render: (p) => <div className="text-sm text-slate-700">{p.type || '—'}</div> },
        { key: 'category', header: 'Category', render: (p) => <div className="text-sm text-slate-700">{p.category || '—'}</div> },
        { key: 'deliveryType', header: 'Delivery', render: (p) => <Badge tone={p.deliveryType === 'FILE' ? 'purple' : 'blue'}>{p.deliveryType}</Badge> },
        { key: 'price', header: 'Price', render: (p) => <span className="font-medium">{formatMoneyPHP(p.price)}</span> },
        { key: 'updatedAt', header: 'Updated' },
        {
            key: 'actions',
            header: '',
            cellClassName: 'text-right',
            render: () => (
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="secondary" disabled>
                        View
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout
            title="Products"
            actions={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-slate-600">Moderator view (read-only)</div>
                    <div className="flex items-center gap-2">
                        <div className="w-[280px] max-w-full">
                            <TextField label={null} value={query} onChange={setQuery} placeholder="Search products" />
                        </div>
                        <Link href={route('admin.dashboard')}>
                            <Button variant="secondary">Back to dashboard</Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Card className="mb-4 p-4">
                <div className="text-sm text-slate-600">View-only product list for analysis. No management actions are available.</div>
            </Card>
            <Table columns={columns} rows={filtered} />
        </AdminLayout>
    );
}
