import { Head, Link, router, usePage } from '@inertiajs/react';
import Card from '@/Components/Admin/Card';
import Badge from '@/Components/Admin/Badge';
import Button from '@/Components/Admin/Button';
import { roleHomeRoute } from '@/lib/rbac';
import { useEffect } from 'react';

export default function Welcome() {
    const page = usePage();
    const user = page?.props?.auth?.user || null;

    useEffect(() => {
        if (user) {
            router.visit(roleHomeRoute(user.role));
        }
    }, [user]);

    if (user) return null;

    return (
        <div className="min-h-screen bg-[#F6F7F8] text-slate-900">
            <Head title="Bookify Admin" />

            <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
                    <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white">
                            <span className="text-sm font-semibold">B</span>
                        </div>
                        <div>
                            <div className="text-sm font-semibold">Bookify Admin Dashboard</div>
                            <div className="text-xs text-slate-500">Operations & control center</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge tone="green">Public</Badge>
                        <Link href={route('login')}>
                            <Button>Login</Button>
                        </Link>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="p-6 lg:col-span-2">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-2xl font-semibold tracking-tight">Manage your platform efficiently</div>
                                <div className="mt-2 text-sm text-slate-600">
                                    Bookify Admin is the control center that mirrors Bookify mobile app features.
                                    Use it to monitor orders, manage products, and communicate with users.
                                </div>
                            </div>
                            <Badge tone="blue">UI-only</Badge>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                                <div className="text-xs font-semibold text-slate-600">About Bookify</div>
                                <div className="mt-2 text-sm text-slate-700">
                                    A digital book platform where users browse, wishlist, purchase, and manage their library.
                                </div>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                                <div className="text-xs font-semibold text-slate-600">Admin responsibilities</div>
                                <div className="mt-2 text-sm text-slate-700">
                                    Monitor payments and orders, manage catalog & categories, push notifications, and control admin access.
                                </div>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                                <div className="text-xs font-semibold text-slate-600">System overview</div>
                                <div className="mt-2 text-sm text-slate-700">
                                    Dashboard overview, products, categories, orders, users, notifications, library, wishlist insights.
                                </div>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                                <div className="text-xs font-semibold text-slate-600">Reminder</div>
                                <div className="mt-2 text-sm text-slate-700">
                                    Always verify order status and keep product inventory accurate. Use notifications responsibly.
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-2">
                            <Link href={route('login')}>
                                <Button>Continue to login</Button>
                            </Link>
                            <Link href={route('login')}>
                                <Button variant="secondary">Explore modules</Button>
                            </Link>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="text-sm font-semibold">What you can do</div>
                        <div className="mt-4 space-y-2">
                            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                                <div className="text-xs font-semibold text-slate-600">Operations</div>
                                <div className="mt-1 text-sm text-slate-700">Orders monitoring, refunds (mock), status updates</div>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                                <div className="text-xs font-semibold text-slate-600">Catalog</div>
                                <div className="mt-1 text-sm text-slate-700">Products & categories CRUD UI (mock)</div>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                                <div className="text-xs font-semibold text-slate-600">Communication</div>
                                <div className="mt-1 text-sm text-slate-700">Create & send notifications (mock)</div>
                            </div>
                            <div className="rounded-xl bg-slate-900 p-4 text-white">
                                <div className="text-xs font-semibold text-white/80">Access control</div>
                                <div className="mt-1 text-sm font-semibold">Role-based navigation</div>
                                <div className="mt-1 text-sm text-white/80">
                                    Super Admin, Admin, and Moderator have different modules.
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
