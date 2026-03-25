import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Admin/Button';
import Card from '@/Components/Admin/Card';
import { formatMoneyPHP } from '@/lib/formatMoneyPHP';
import { Link, usePage } from '@inertiajs/react';
import { useMemo } from 'react';

export default function OrdersShow() {
    const { props } = usePage();
    const order = props?.order || null;

    if (!order) {
        return (
            <AdminLayout title="Order not found">
                <Card className="p-6">
                    <div className="text-sm font-semibold">Order not found</div>
                    <div className="mt-1 text-sm text-slate-600">
                        The requested order does not exist.
                    </div>
                    <div className="mt-4">
                        <Link href={route('admin.orders.index')}>
                            <Button variant="secondary">Back to orders</Button>
                        </Link>
                    </div>
                </Card>
            </AdminLayout>
        );
    }

    const productSummary = useMemo(() => {
        if (!Array.isArray(order.items)) return '—';
        const names = order.items.map((item) => item.productName).filter(Boolean);
        return names.length ? names.join(', ') : '—';
    }, [order.items]);

    return (
        <AdminLayout
            title={`Purchased ${order.id}`}
            actions={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Link href={route('admin.orders.index')}>
                            <Button variant="secondary">Back</Button>
                        </Link>
                        <div className="text-sm text-slate-600">Reference ID {order.referenceId}</div>
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <Card className="p-5">
                    <div className="text-sm font-semibold">Order summary</div>
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <div className="text-xs font-semibold text-slate-600">Customer</div>
                            <div className="mt-2 text-sm font-semibold text-slate-900">{order.customerName}</div>
                            <div className="mt-1 text-sm text-slate-600">{order.customerEmail || '—'}</div>
                            <div className="mt-3">
                                <Link href={route('admin.customers.show', { userId: order.userId })}>
                                    <Button variant="secondary" size="sm">
                                        View User
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <div className="text-xs font-semibold text-slate-600">Payment</div>
                            <div className="mt-2 text-sm font-semibold text-slate-900">{order.paymentMethod || '—'}</div>
                            <div className="mt-3 text-xs font-semibold text-slate-600">Reference ID</div>
                            <div className="mt-1 text-sm font-semibold text-slate-900">{order.referenceId}</div>
                            <div className="mt-3 text-xs font-semibold text-slate-600">Product name</div>
                            <div className="mt-1 text-sm text-slate-700">{productSummary}</div>
                            <div className="mt-3 text-xs font-semibold text-slate-600">Date</div>
                            <div className="mt-1 text-sm text-slate-700">{order.date || '—'}</div>
                            <div className="mt-1 text-sm text-slate-600">Total</div>
                            <div className="mt-1 text-lg font-semibold text-slate-900">
                                {formatMoneyPHP(order.total)}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 p-4">
                        <div className="text-sm font-semibold">Products</div>
                        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                            {Array.isArray(order.items) && order.items.length ? (
                                order.items.map((item, idx) => (
                                    <div
                                        key={`${item.productId}-${idx}`}
                                        className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200"
                                    >
                                        <div className="text-sm font-semibold text-slate-900">{item.productName || '—'}</div>
                                        <div className="text-xs text-slate-500">Reference ID: {item.productId || '—'}</div>
                                        <div className="text-xs text-slate-500">
                                            {formatMoneyPHP(item.price || 0)} x {item.quantity || 0}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-slate-600">No products found for this order.</div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}
