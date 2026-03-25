import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/Admin/Badge';
import Button from '@/Components/Admin/Button';
import Card from '@/Components/Admin/Card';
import Table from '@/Components/Admin/Table';
import TextField from '@/Components/Admin/TextField';
import SelectField from '@/Components/Admin/SelectField';
import { formatMoneyPHP } from '@/lib/formatMoneyPHP';
import { Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function tone(online) {
    return online ? 'green' : 'gray';
}

export default function CustomersIndex() {
    const { props } = usePage();
    const customers = Array.isArray(props?.customers) ? props.customers : [];

    const [query, setQuery] = useState('');
    const [onlineFilter, setOnlineFilter] = useState('all'); // all | online | offline

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return customers.filter((u) => {
            const matchesQ =
                !q ||
                String(u?.name || '').toLowerCase().includes(q) ||
                String(u?.email || '').toLowerCase().includes(q) ||
                String(u?.id || '').toLowerCase().includes(q);

            const desiredOnline = onlineFilter === 'online' ? true : onlineFilter === 'offline' ? false : null;
            const matchesOnline = desiredOnline === null ? true : u.online === desiredOnline;

            return matchesQ && matchesOnline;
        });
    }, [query, onlineFilter, customers]);

    const totals = useMemo(() => {
        return filtered.reduce(
            (acc, u) => {
                acc.totalPurchases += u?.summary?.totalPurchases ?? 0;
                acc.totalSpent += u?.summary?.totalSpent ?? 0;
                acc.productsBought += u?.summary?.productsBought ?? 0;
                return acc;
            },
            { totalPurchases: 0, totalSpent: 0, productsBought: 0 },
        );
    }, [filtered]);

    const columns = [
        {
            key: 'name',
            header: 'Customer',
            render: (u) => (
                <div>
                    <div className="font-medium text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                </div>
            ),
        },
        { key: 'registeredAt', header: 'Registered' },
        {
            key: 'online',
            header: 'Online / Offline',
            render: (u) => <Badge tone={tone(u.online)}>{u.online ? 'Online' : 'Offline'}</Badge>,
        },
        {
            key: 'summary',
            header: 'Summary',
            render: (u) => (
                <div>
                    <div className="text-sm font-semibold text-slate-900">{u.summary?.totalPurchases ?? 0} purchases</div>
                    <div className="text-xs text-slate-500">
                        {formatMoneyPHP(u.summary?.totalSpent ?? 0)} • {u.summary?.productsBought ?? 0} products
                    </div>
                </div>
            ),
        },
        {
            key: 'actions',
            header: '',
            cellClassName: 'text-right',
            render: (u) => (
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link href={route('admin.customers.show', { userId: u.id })}>
                        <Button size="sm" variant="secondary">
                            View
                        </Button>
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout
            title="Customers"
            actions={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="w-[260px] max-w-full">
                            <TextField label={null} value={query} onChange={setQuery} placeholder="Search customers" />
                        </div>
                        <div className="w-[220px] max-w-full">
                            <SelectField
                                label={null}
                                value={onlineFilter}
                                onChange={setOnlineFilter}
                                options={[
                                    { label: 'All', value: 'all' },
                                    { label: 'Online', value: 'online' },
                                    { label: 'Offline', value: 'offline' },
                                ]}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={route('admin.notifications.index')}>
                            <Button variant="secondary">Send notification</Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Table
                columns={columns}
                rows={filtered}
                onRowClick={(u) => {
                    window.location.href = route('admin.customers.show', { userId: u.id });
                }}
            />

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
                <Card className="p-5">
                    <div className="text-sm font-semibold">Customers</div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                            <span>Total customers</span>
                            <span className="font-semibold text-slate-900">{filtered.length}</span>
                        </div>
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="text-sm font-semibold">Purchases</div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                            <span>Total purchases</span>
                            <span className="font-semibold text-slate-900">{totals.totalPurchases}</span>
                        </div>
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="text-sm font-semibold">Revenue</div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                            <span>Total spent</span>
                            <span className="font-semibold text-slate-900">{formatMoneyPHP(totals.totalSpent)}</span>
                        </div>
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="text-sm font-semibold">Products</div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                            <span>Products bought</span>
                            <span className="font-semibold text-slate-900">{totals.productsBought}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}
