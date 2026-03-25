import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/Admin/Badge';
import Card from '@/Components/Admin/Card';
import { formatMoneyPHP } from '@/mock/adminData'; // Still needed strictly for frontend formatting rules
import { usePage } from '@inertiajs/react';

function BarList({ title, tone = 'blue', items }) {
    const max = Math.max(...items.map((x) => Number(x.value) || 0), 1);

    return (
        <Card className="p-5">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm font-semibold">{title}</div>
                    <div className="text-sm text-slate-500">Real-time database analytics</div>
                </div>
                <Badge tone={tone}>Bar</Badge>
            </div>

            <div className="mt-4 space-y-3">
                {items.length === 0 ? (
                    <div className="text-sm text-slate-500 py-2">No product analytics currently available.</div>
                ) : items.map((x) => (
                    <div key={x.id} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-slate-900">{x.label}</div>
                                <div className="mt-1 text-xs text-slate-500">{x.hint}</div>
                            </div>
                            <div className="shrink-0 text-sm font-semibold text-slate-900">
                                {x.hint.includes('Revenue') ? formatMoneyPHP(x.value) : x.value}
                            </div>
                        </div>
                        <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
                            <div
                                className="h-2 rounded-full bg-slate-900"
                                style={{ width: `${Math.round(((Number(x.value) || 0) / max) * 100)}%`, opacity: 0.25 + ((Number(x.value) || 0) / max) * 0.7 }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

export default function ProductPerformance() {
    const page = usePage();
    const performanceData = page?.props?.performanceData || {};

    const topSelling = performanceData.topSelling || [];
    const leastSelling = performanceData.leastSelling || [];
    const topRevenue = performanceData.topRevenue || [];

    return (
        <AdminLayout
            title="Product Performance"
            actions={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-slate-600">Top and least selling products overview</div>
                    <div className="flex items-center gap-2">
                        <Badge tone="blue">Moderator</Badge>
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <BarList title="Top selling products" tone="blue" items={topSelling} />
                <BarList title="Least selling products" tone="yellow" items={leastSelling} />
                <BarList title="Top revenue products" tone="green" items={topRevenue} />
            </div>
        </AdminLayout>
    );
}
