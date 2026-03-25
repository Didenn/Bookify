import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/Admin/Badge';
import Button from '@/Components/Admin/Button';
import Card from '@/Components/Admin/Card';
import { Link } from '@inertiajs/react';

export default function About() {
    return (
        <AdminLayout
            title="About"
            actions={
                <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">Admin control panel for the Bookify mobile app</div>
                    <Badge tone="green">UI-only</Badge>
                </div>
            }
        >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="p-6 lg:col-span-2">
                    <div className="text-sm font-semibold">Bookify</div>
                    <div className="mt-2 text-sm text-slate-600">
                        This admin dashboard mirrors the Bookify React Native app screens and operational flows.
                        Everything here is mock data and UI-only — designed with a Shopify-style layout.
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <div className="text-xs font-semibold text-slate-600">Mobile modules</div>
                            <div className="mt-2 space-y-1 text-sm text-slate-700">
                                <div>Home / Discover</div>
                                <div>Shop / Product detail</div>
                                <div>Cart / Checkout</div>
                                <div>Library</div>
                                <div>Wishlist</div>
                                <div>Notifications</div>
                                <div>Profile / About</div>
                            </div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <div className="text-xs font-semibold text-slate-600">Admin equivalents</div>
                            <div className="mt-2 space-y-1 text-sm text-slate-700">
                                <div>Dashboard overview</div>
                                <div>Products & Categories</div>
                                <div>Orders monitoring</div>
                                <div>User management</div>
                                <div>Notification center</div>
                                <div>Library publishing</div>
                                <div>Wishlist insights</div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="text-sm font-semibold">Quick links</div>
                    <div className="mt-4 space-y-2">
                        <Link href={route('admin.dashboard')} className="block">
                            <Button variant="secondary" className="w-full">
                                Dashboard
                            </Button>
                        </Link>
                        <Link href={route('admin.products.index')} className="block">
                            <Button variant="secondary" className="w-full">
                                Products
                            </Button>
                        </Link>
                        <Link href={route('admin.orders.index')} className="block">
                            <Button variant="secondary" className="w-full">
                                Orders
                            </Button>
                        </Link>
                        <Link href={route('admin.notifications.index')} className="block">
                            <Button variant="secondary" className="w-full">
                                Notifications
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-6 rounded-2xl bg-slate-900 p-4 text-white">
                        <div className="text-xs font-semibold text-white/80">Design reference</div>
                        <div className="mt-2 text-sm font-semibold">Shopify Admin</div>
                        <div className="mt-1 text-sm text-white/80">
                            Clean cards, spacing, focus rings, and crisp tables.
                        </div>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}
