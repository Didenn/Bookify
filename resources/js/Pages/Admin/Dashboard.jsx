import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/Admin/Card';
import Badge from '@/Components/Admin/Badge';
import Button from '@/Components/Admin/Button';
import { Link, usePage } from '@inertiajs/react';
import { roleLabel } from '@/lib/rbac';
import { formatMoneyPHP } from '@/mock/adminData'; // We can keep formatMoneyPHP from here or move it later

function Stat({ label, value, hint, tone = 'gray' }) {
    return (
        <Card className="p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-[13px] font-medium text-slate-600">{label}</div>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-[#1a1a1a]">
                        {value}
                    </div>
                    {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
                </div>
                <Badge tone={tone}>{tone === 'green' ? 'Good' : tone === 'yellow' ? 'Watch' : 'Info'}</Badge>
            </div>
        </Card>
    );
}

function MiniBar({ items }) {
    const max = Math.max(...items.map((x) => x.value), 1);

    return (
        <div className="flex h-20 items-end gap-2">
            {items.map((x) => (
                <div key={x.label} className="flex-1">
                    <div
                        className="w-full rounded-lg bg-slate-900/10"
                        style={{ height: `${Math.round((x.value / max) * 100)}%` }}
                    >
                        <div
                            className="h-full w-full rounded-lg bg-slate-900"
                            style={{ opacity: 0.18 + (x.value / max) * 0.6 }}
                        />
                    </div>
                    <div className="mt-2 text-center text-[11px] font-medium text-slate-500">
                        {x.label}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function Dashboard() {
    const page = usePage();
    const user = page?.props?.auth?.user || null;
    const productStats = page?.props?.productStats || {};
    const dashboardData = page?.props?.dashboardData || {};

    const isSuperAdmin = user?.role === 'super_admin';
    const isAdmin = user?.role === 'admin';
    const isModerator = user?.role === 'moderator';

    const totalProducts = Number(productStats?.totalProducts || 0);
    const recentProductsAdded = Array.isArray(productStats?.recentProductsAdded) ? productStats.recentProductsAdded : [];
    const recentlyEditedProducts = Array.isArray(productStats?.recentlyEditedProducts) ? productStats.recentlyEditedProducts : [];
    const weeklyAddedProducts = Number(productStats?.weeklyAddedProducts || 0);
    const typeBreakdown = productStats?.typeBreakdown || { LINK: 0, FILE: 0 };
    const totalUsers = Number(productStats?.totalUsers || 0);

    const transactions = Number(dashboardData?.transactions || 0);
    const totalSales = Number(dashboardData?.totalSales || 0);
    const completedOrders = Number(dashboardData?.completed || 0);
    const recentOrders = Array.isArray(dashboardData?.recentOrders) ? dashboardData.recentOrders : [];
    const recentCustomers = Array.isArray(dashboardData?.recentCustomers) ? dashboardData.recentCustomers : [];
    const chart = Array.isArray(dashboardData?.chart) ? dashboardData.chart : [];

    return (
        <AdminLayout
            title="Dashboard"
            actions={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-slate-600">
                        {isModerator
                            ? 'Moderator overview (data & insights)'
                            : 'Overview of Bookify operations'}
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge tone="blue">{roleLabel(user?.role)}</Badge>
                        {isSuperAdmin ? (
                            <>
                                <Link href={route('admin.notifications.index')}>
                                    <Button variant="secondary">Create notification</Button>
                                </Link>
                                <Link href={route('admin.products.index')}>
                                    <Button>Add product</Button>
                                </Link>
                            </>
                        ) : isAdmin ? (
                            <Link href={route('admin.products.index')}>
                                <Button>Add product</Button>
                            </Link>
                        ) : isModerator ? (
                            <>
                                <Link href={route('admin.moderator.monitoring')}>
                                    <Button variant="secondary">Open monitoring</Button>
                                </Link>
                                <Link href={route('admin.moderator.products.index')}>
                                    <Button>View products</Button>
                                </Link>
                            </>
                        ) : null}
                    </div>
                </div>
            }
        >
            {isModerator ? (
                <>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                        <Stat label="Transactions" value={transactions} hint="All payments" tone="blue" />
                        <Stat label="Revenue" value={formatMoneyPHP(totalSales)} hint="Completed payments" tone="green" />
                        <Stat label="Products" value={totalProducts} hint="View-only" tone="purple" />
                        <Stat label="Completed" value={completedOrders} hint="Settled" tone="gray" />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <Card className="p-5 lg:col-span-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-semibold">Latest transactions</div>
                                    <div className="text-sm text-slate-500">Read-only monitoring</div>
                                </div>
                                <Link
                                    href={route('admin.orders.index')}
                                    className="text-sm font-medium text-slate-900 underline"
                                >
                                    View all
                                </Link>
                            </div>
                            <div className="mt-4 space-y-2">
                                {recentOrders.length === 0 ? (
                                    <div className="text-sm text-slate-500">No transactions yet.</div>
                                ) : recentOrders.map((o) => (
                                    <Link
                                        key={o.id}
                                        href={route('admin.orders.show', { orderId: o.id })}
                                        className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200 hover:bg-white"
                                    >
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">{o.referenceId || o.id}</div>
                                            <div className="text-xs text-slate-500">{o.customer} • {o.product || '—'}</div>
                                        </div>
                                        <Badge tone={o.status === 'completed' ? 'green' : 'red'}>
                                            {o.status}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-5">
                            <div className="text-sm font-semibold">Products</div>
                            <div className="mt-2 text-sm text-slate-500">View-only</div>
                            <div className="mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                                <div className="text-xs font-semibold text-slate-600">Total products</div>
                                <div className="mt-2 text-2xl font-semibold text-slate-900">{totalProducts}</div>
                            </div>
                            <div className="mt-4">
                                <Link href={route('admin.moderator.products.index')}>
                                    <Button className="w-full">View all products</Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </>
            ) : isAdmin ? (
                <>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                        <Stat label="Total Products" value={totalProducts} hint="Digital items" tone="green" />
                        <Stat label="Recent Products Added" value={recentProductsAdded.length} hint="Latest updates" tone="blue" />
                        <Stat label="Weekly Added Products" value={weeklyAddedProducts} hint="Last 7 days" tone="purple" />
                        <Stat label="Recently Edited Products" value={recentlyEditedProducts.length} hint="Latest edits" tone="gray" />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <Card className="p-5 lg:col-span-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-semibold">Weekly added products</div>
                                    <div className="text-sm text-slate-500">Products created in the last 7 days</div>
                                </div>
                                <Badge tone="blue">Live view</Badge>
                            </div>
                            <div className="mt-5">
                                <MiniBar items={chart} />
                            </div>
                        </Card>

                        <Card className="p-5">
                            <div className="text-sm font-semibold">Recently edited products</div>
                            <div className="mt-4 space-y-2">
                                {recentlyEditedProducts.length === 0 ? (
                                    <div className="text-sm text-slate-500">No recent edits.</div>
                                ) : recentlyEditedProducts.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200"
                                    >
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">{p.title}</div>
                                            <div className="text-xs text-slate-500">{p.updatedAt || p.createdAt || p.id}</div>
                                        </div>
                                        <Badge tone={p.deliveryType === 'FILE' ? 'purple' : 'blue'}>
                                            {p.deliveryType === 'FILE' ? 'File' : 'Link'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <Card className="p-5 lg:col-span-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-semibold">Recent products added</div>
                                    <div className="text-sm text-slate-500">Latest updates</div>
                                </div>
                                <Link href={route('admin.products.index')} className="text-sm font-medium text-slate-900 underline">
                                    Manage
                                </Link>
                            </div>
                            <div className="mt-4 space-y-2">
                                {recentProductsAdded.length === 0 ? (
                                    <div className="text-sm text-slate-500">No products added yet.</div>
                                ) : recentProductsAdded.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200"
                                    >
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">{p.title}</div>
                                            <div className="text-xs text-slate-500">{p.createdAt || p.updatedAt || p.id}</div>
                                        </div>
                                        <Badge tone={p.deliveryType === 'FILE' ? 'purple' : 'blue'}>
                                            {p.deliveryType === 'FILE' ? 'File' : 'Link'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-5">
                            <div className="text-sm font-semibold">Product type breakdown</div>
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="text-slate-600">Link products</div>
                                    <div className="font-semibold text-slate-900">
                                        {Number(typeBreakdown?.LINK || 0)}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="text-slate-600">File products</div>
                                    <div className="font-semibold text-slate-900">
                                        {Number(typeBreakdown?.FILE || 0)}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <Stat label="Total Products" value={totalProducts} hint="Digital items" tone="green" />
                        <Stat label="Total Users" value={totalUsers} hint="Customers" tone="gray" />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <Card className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-semibold">New products added</div>
                                    <div className="text-sm text-slate-500">Latest updates</div>
                                </div>
                                <Link href={route('admin.products.index')} className="text-sm font-medium text-slate-900 underline">
                                    Manage
                                </Link>
                            </div>
                            <div className="mt-4 space-y-2">
                                {recentProductsAdded.length === 0 ? (
                                    <div className="text-sm text-slate-500">No products added yet.</div>
                                ) : recentProductsAdded.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200"
                                    >
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">{p.title}</div>
                                            <div className="text-xs text-slate-500">{p.createdAt || p.updatedAt || p.id}</div>
                                        </div>
                                        <Badge tone={p.deliveryType === 'FILE' ? 'purple' : 'blue'}>
                                            {p.deliveryType === 'FILE' ? 'File' : 'Link'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        <Card className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-semibold">Customers</div>
                                    <div className="text-sm text-slate-500">Accounts overview</div>
                                </div>
                                <Link href={route('admin.customers.index')} className="text-sm font-medium text-slate-900 underline">
                                    Manage
                                </Link>
                            </div>
                            <div className="mt-4 space-y-2">
                                {recentCustomers.length === 0 ? (
                                    <div className="text-sm text-slate-500">No customers found.</div>
                                ) : recentCustomers.map((u) => (
                                    <Link
                                        key={u.id}
                                        href={route('admin.customers.show', { userId: u.id })}
                                        className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200 hover:bg-white"
                                    >
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">{u.name}</div>
                                            <div className="text-xs text-slate-500">{u.email}</div>
                                        </div>
                                        <Badge tone={u.status === 'active' ? 'green' : 'gray'}>{u.status}</Badge>
                                    </Link>
                                ))}
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
