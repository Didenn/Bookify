import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/Admin/Badge';
import Button from '@/Components/Admin/Button';
import Card from '@/Components/Admin/Card';
import { formatMoneyPHP } from '@/lib/formatMoneyPHP';
import { Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function tone(online) {
    return online ? 'green' : 'gray';
}

export default function CustomersShow() {
    const { props } = usePage();
    const customer = props?.customer || null;
    const orders = Array.isArray(props?.orders) ? props.orders : [];

    const productTitlesByOrder = useMemo(() => {
        return orders.map((o) => {
            const titles = Array.isArray(o.products) ? o.products.map((p) => p.title).filter(Boolean) : [];
            return { orderId: o.id, titles };
        });
    }, [orders]);

    if (!customer) {
        return (
            <AdminLayout title="Customer not found">
                <Card className="p-6">
                    <div className="text-sm font-semibold">Customer not found</div>
                    <div className="mt-1 text-sm text-slate-600">The requested customer does not exist.</div>
                    <div className="mt-4">
                        <Link href={route('admin.customers.index')}>
                            <Button variant="secondary">Back to customers</Button>
                        </Link>
                    </div>
                </Card>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title={customer.name}
            actions={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Link href={route('admin.customers.index')}>
                            <Button variant="secondary">Back</Button>
                        </Link>
                        <Badge tone={tone(customer.online)}>{customer.online ? 'Online' : 'Offline'}</Badge>
                        <div className="text-sm text-slate-600">Registered {customer.registeredAt}</div>
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="p-5 lg:col-span-3">
                    <div className="text-sm font-semibold">Customer profile</div>
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <div className="text-xs font-semibold text-slate-600">Name</div>
                            <div className="mt-2 text-sm font-semibold text-slate-900">{customer.name}</div>

                            <div className="mt-3 text-xs font-semibold text-slate-600">Email</div>
                            <div className="mt-2 text-sm font-semibold text-slate-900">{customer.email}</div>

                            {customer.lastSeenAt ? (
                                <div className="mt-1 text-sm text-slate-600">Last seen {customer.lastSeenAt}</div>
                            ) : null}
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <div className="text-xs font-semibold text-slate-600">Summary</div>
                            <div className="mt-2 text-2xl font-semibold text-slate-900">
                                {customer.summary?.totalPurchases ?? 0}
                            </div>
                            <div className="mt-1 text-sm text-slate-600">
                                {formatMoneyPHP(customer.summary?.totalSpent ?? 0)} • {customer.summary?.productsBought ?? 0} products
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 p-4">
                        <div className="text-sm font-semibold">Purchase history</div>
                        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                            {orders.length ? (
                                orders.map((o) => {
                                    const titlesRow = productTitlesByOrder.find((x) => x.orderId === o.id);
                                    const productTitles = titlesRow?.titles || [];

                                    const displayed = productTitles.slice(0, 2);
                                    const extraCount = Math.max(0, productTitles.length - displayed.length);
                                    const productText = extraCount
                                        ? `${displayed.join(', ')} +${extraCount} more`
                                        : displayed.join(', ');

                                    return (
                                        <Link
                                            key={o.id}
                                            href={route('admin.orders.show', { orderId: o.id })}
                                            className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200 hover:bg-white"
                                        >
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900">{o.id}</div>
                                                <div className="text-xs text-slate-500">{productText || '—'}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-medium text-slate-600">{o.createdAt}</div>
                                                <div className="text-xs text-slate-500">{formatMoneyPHP(o.total ?? 0)}</div>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="text-sm text-slate-600">No purchases found.</div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}
