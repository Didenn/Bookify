import { useEffect, useMemo, useState } from 'react';
import { Link, Head, router, usePage } from '@inertiajs/react';
import { canAccess, roleHomeRoute, roleLabel } from '@/lib/rbac';
import ensureCsrf from '@/lib/ensureCsrf';
import { confirmAction, toast } from '@/lib/ux';
import Toast from '@/Components/Admin/Toast';
import ConfirmModal from '@/Components/Admin/ConfirmModal';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

function Icon({ name, className }) {
    const common = { className: classNames('shrink-0', className) };

    switch (name) {
        case 'home':
            return (
                <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
                </svg>
            );
        case 'box':
            return (
                <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 8.5 12 3 3 8.5 12 14l9-5.5Z" />
                    <path d="M3 8.5V16l9 5 9-5V8.5" />
                </svg>
            );
        case 'tag':
            return (
                <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 12V7a2 2 0 0 0-2-2h-5L3 15l6 6 10-10Z" />
                    <path d="M7 7h.01" />
                </svg>
            );
        case 'receipt':
            return (
                <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2h12v20l-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1V2Z" />
                    <path d="M9 6h6" />
                    <path d="M9 10h6" />
                    <path d="M9 14h6" />
                </svg>
            );
        case 'users':
            return (
                <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-1a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v1" />
                    <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                    <path d="M23 21v-1a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            );
        case 'bell':
            return (
                <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
            );
        case 'book':
            return (
                <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z" />
                </svg>
            );
        case 'heart':
            return (
                <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
                </svg>
            );
        case 'info':
            return (
                <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                </svg>
            );
        case 'search':
            return (
                <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 21l-4.35-4.35" />
                    <circle cx="11" cy="11" r="7" />
                </svg>
            );
        case 'menu':
            return (
                <svg {...common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16" />
                    <path d="M4 12h16" />
                    <path d="M4 18h16" />
                </svg>
            );
        default:
            return null;
    }
}

const NAV = [
    { label: 'Dashboard', href: () => route('admin.dashboard'), icon: 'home', key: 'admin.dashboard' },
    { label: 'Analysis', href: () => route('admin.moderator.monitoring'), icon: 'receipt', key: 'admin.moderator.monitoring' },
    { label: 'Product Performance', href: () => route('admin.moderator.product_performance'), icon: 'box', key: 'admin.moderator.product_performance' },
    { label: 'Products', href: () => route('admin.products.index'), icon: 'box', key: 'admin.products.index' },
    { label: 'Notifications', href: () => route('admin.notifications.index'), icon: 'bell', key: 'admin.notifications.index' },
    { label: 'Purchased', href: () => route('admin.orders.index'), icon: 'receipt', key: 'admin.orders.index' },
    { label: 'Customers', href: () => route('admin.customers.index'), icon: 'users', key: 'admin.customers.index' },
    { label: 'Staff', href: () => route('admin.staff.index'), icon: 'users', key: 'admin.staff.index' },
];

function SidebarItem({ item, isActive, onNavigate }) {
    return (
        <Link
            href={item.href()}
            onClick={() => onNavigate?.()}
            className={classNames(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                isActive
                    ? 'bg-slate-100 text-slate-900 border-l-[3px] border-[#1a1a1a] pl-[9px]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-[3px] border-transparent pl-[9px]',
            )}
        >
            <Icon
                name={item.icon}
                className={classNames(
                    'h-[18px] w-[18px]',
                    isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600',
                )}
            />
            <span>{item.label}</span>
        </Link>
    );
}

export default function AdminLayout({ title, children, actions }) {
    const page = usePage();
    const user = page?.props?.auth?.user || null;
    const currentUrl = page.url || '';
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const activeKey = useMemo(() => {
        const byPrefix = [
            { prefix: '/admin/dashboard', key: 'admin.dashboard' },
            { prefix: '/admin/staff', key: 'admin.staff.index' },
            { prefix: '/admin/customers', key: 'admin.customers.index' },
            { prefix: '/admin/moderator-monitoring', key: 'admin.moderator.monitoring' },
            { prefix: '/admin/moderator/product-performance', key: 'admin.moderator.product_performance' },
            { prefix: '/admin/products', key: 'admin.products.index' },
            { prefix: '/admin/categories', key: 'admin.categories.index' },
            { prefix: '/admin/notifications', key: 'admin.notifications.index' },
            { prefix: '/admin/orders', key: 'admin.orders.index' },
        ];

        const match = byPrefix.find((x) => currentUrl.startsWith(x.prefix));
        return match?.key;
    }, [currentUrl]);

    useEffect(() => {
        if (!user) {
            router.visit(route('welcome'));
            return;
        }

        if (activeKey && !canAccess(user.role, activeKey)) {
            router.visit(roleHomeRoute(user.role));
        }
    }, [user, activeKey]);

    const navItems = useMemo(() => {
        if (!user) return [];
        return NAV.filter((item) => canAccess(user.role, item.key));
    }, [user]);

    const handleLogout = () => {
        confirmAction({
            title: 'Log out',
            message: 'Are you sure you want to log out matching Shopify expectations?',
            onConfirm: async () => {
                toast('Logging out...', 'success');
                await ensureCsrf();
                setTimeout(() => {
                    router.post(route('logout'));
                }, 1000);
            }
        });
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#F4F6F8] text-[#1a1a1a] font-sans">
            <Toast />
            <ConfirmModal />
            <Head title={title || 'Admin'} />

            <div className="flex">
                <div className="hidden w-[240px] shrink-0 border-r border-slate-200 bg-[#ebebeb] lg:block">
                    <div className="sticky top-0 h-screen overflow-y-auto">
                        <div className="flex items-center justify-between px-4 py-4 mt-2">
                            <Link href={route('admin.dashboard')} className="flex items-center gap-2">
                                <img 
                                    src="/images/logolara.png" 
                                    alt="Bookify Logo" 
                                    className="h-8 w-8 rounded-lg"
                                />
                                <div className="leading-tight">
                                    <div className="text-sm font-bold">Bookify</div>
                                </div>
                            </Link>
                            <div className="rounded-lg bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                {roleLabel(user.role)}
                            </div>
                        </div>

                        <div className="px-3 pb-4">
                            <div className="space-y-1">
                                {navItems.map((item) => (
                                    <SidebarItem
                                        key={item.key}
                                        item={item}
                                        isActive={activeKey === item.key}
                                    />
                                ))}
                            </div>

                            <div className="mt-4 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                                <div className="text-xs font-semibold text-slate-700">Quick actions</div>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    {user.role === 'moderator' ? (
                                        <>
                                            <Link
                                                href={route('admin.moderator.monitoring')}
                                                className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-black/5 hover:bg-slate-50"
                                            >
                                                Sales overview
                                            </Link>
                                            <Link
                                                href={route('admin.moderator.product_performance')}
                                                className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-black/5 hover:bg-slate-50"
                                            >
                                                Product performance
                                            </Link>
                                            <Link
                                                href={route('admin.moderator.products.index')}
                                                className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-black/5 hover:bg-slate-50"
                                            >
                                                View products
                                            </Link>
                                            <Link
                                                href={route('admin.orders.index')}
                                                className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-black/5 hover:bg-slate-50"
                                            >
                                                View orders
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('admin.products.index')}
                                                className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-black/5 hover:bg-slate-50"
                                            >
                                                Add product
                                            </Link>
                                            <Link
                                                href={route('admin.notifications.index')}
                                                className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-black/5 hover:bg-slate-50"
                                            >
                                                Notifications
                                            </Link>
                                            <Link
                                                href={route('admin.orders.index')}
                                                className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-black/5 hover:bg-slate-50"
                                            >
                                                View orders
                                            </Link>
                                        </>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                                    >
                                        Log out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col pb-16">
                    <div className="sticky top-0 z-30 bg-[#F4F6F8]/80 backdrop-blur">
                        <div className="px-4 py-4 lg:px-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSidebarOpen(true)}
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
                                    >
                                        <Icon name="menu" className="h-5 w-5" />
                                    </button>

                                    <div>
                                        <div className="text-sm font-semibold">{title}</div>
                                        <div className="text-xs text-slate-500">
                                            Shopify-style UI with mock data
                                        </div>
                                    </div>
                                </div>



                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition"
                                    >
                                        Log out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 pt-2 lg:px-8 max-w-7xl">
                        {actions ? <div className="mb-4">{actions}</div> : null}
                        {children}
                    </div>
                </div>
            </div>

            {sidebarOpen ? (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/30"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="absolute inset-y-0 left-0 w-[86%] max-w-[320px] bg-white p-4 shadow-xl">
                        <div className="flex items-center justify-between">
                            <Link href={route('admin.dashboard')} className="flex items-center gap-2">
                                <img 
                                    src="/images/logolara.png" 
                                    alt="Bookify Logo" 
                                    className="h-9 w-9 rounded-xl"
                                />
                                <div className="text-sm font-semibold">Bookify Admin</div>
                            </Link>
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(false)}
                                className="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                            >
                                Close
                            </button>
                        </div>

                        <div className="mt-4 space-y-1">
                            {navItems.map((item) => (
                                <SidebarItem
                                    key={item.key}
                                    item={item}
                                    isActive={activeKey === item.key}
                                    onNavigate={() => setSidebarOpen(false)}
                                />
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    setSidebarOpen(false);
                                    handleLogout();
                                }}
                                className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
