import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Admin/Button';
import Table from '@/Components/Admin/Table';
import TextField from '@/Components/Admin/TextField';
import { formatMoneyPHP } from '@/lib/formatMoneyPHP';
import { Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function OrdersIndex() {
    const { props } = usePage();
    const rows = Array.isArray(props?.orders) ? props.orders : [];
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return rows.filter((o) => {
            const matchesQ =
                !q ||
                String(o?.id || '').toLowerCase().includes(q) ||
                String(o?.productReferenceId || '').toLowerCase().includes(q) ||
                String(o?.customerName || '').toLowerCase().includes(q) ||
                String(o?.customerEmail || '').toLowerCase().includes(q) ||
                String(o?.paymentMethod || '').toLowerCase().includes(q) ||
                String(o?.productName || '').toLowerCase().includes(q);
            return matchesQ;
        });
    }, [query, rows]);

    const columns = [
        {
            key: 'productReferenceId',
            header: 'Product Reference ID',
            render: (o) => <span className="text-xs font-semibold text-slate-700">{o.productReferenceId || '—'}</span>,
        },
        {
            key: 'customerName',
            header: 'Customer',
            render: (o) => (
                <div>
                    <div className="text-sm font-medium text-slate-900">{o.customerName}</div>
                    <div className="text-xs text-slate-500">{o.customerEmail}</div>
                </div>
            ),
        },
        {
            key: 'total',
            header: 'Total / Price',
            render: (o) => <span className="font-medium">{formatMoneyPHP(o.total)}</span>,
        },
        { key: 'paymentMethod', header: 'Payment Method' },
        { key: 'date', header: 'Date' },
        {
            key: 'actions',
            header: '',
            cellClassName: 'text-right',
            render: (o) => (
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link href={route('admin.orders.show', { orderId: o.id })}>
                        <Button size="sm" variant="secondary">
                            Details
                        </Button>
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout
            title="Purchased"
            actions={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="w-[260px] max-w-full">
                            <TextField
                                label={null}
                                value={query}
                                onChange={setQuery}
                                placeholder="Search (order ID, product ref, customer, payment)"
                            />
                        </div>
                    </div>
                </div>
            }
        >
            <Table
                columns={columns}
                rows={filtered}
                onRowClick={(o) => {
                    window.location.href = route('admin.orders.show', { orderId: o.id });
                }}
            />
        </AdminLayout>
    );
}
