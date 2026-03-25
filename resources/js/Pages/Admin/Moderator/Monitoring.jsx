import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/Admin/Badge';
import Button from '@/Components/Admin/Button';
import Card from '@/Components/Admin/Card';
import { formatMoneyPHP } from '@/mock/adminData';
import { useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';

export default function Monitoring() {
    const page = usePage();
    const analytics = page?.props?.analytics || {};
    const filters = page?.props?.filters || {};

    // We replace local filtering/react state for "range" to instead query the backend
    const [preset, setPreset] = useState('this_month');
    const [rangeStart, setRangeStart] = useState(filters.start || '');
    const [rangeEnd, setRangeEnd] = useState(filters.end || '');
    const [calendarMonth, setCalendarMonth] = useState(() => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
    });

    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const updateFilter = (newPreset, s, e) => {
        setPreset(newPreset);
        setRangeStart(s);
        setRangeEnd(e);

        router.get(
            route('admin.moderator.monitoring'),
            { start: s, end: e },
            { preserveState: true }
        );
    };

    const handlePresetChange = (p) => {
        const now = new Date();
        let s, e;

        if (p === 'today') {
            s = now.toISOString().split('T')[0];
            e = s;
        } else if (p === 'this_week') {
            const day = now.getDay();
            const diff = (day + 6) % 7;
            const startDt = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
            const endDt = new Date(startDt.getFullYear(), startDt.getMonth(), startDt.getDate() + 6);
            s = startDt.toISOString().split('T')[0];
            e = endDt.toISOString().split('T')[0];
        } else if (p === 'this_month') {
            const startDt = new Date(now.getFullYear(), now.getMonth(), 1);
            const endDt = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            s = [startDt.getFullYear(), String(startDt.getMonth() + 1).padStart(2, '0'), String(startDt.getDate()).padStart(2, '0')].join('-');
            e = [endDt.getFullYear(), String(endDt.getMonth() + 1).padStart(2, '0'), String(endDt.getDate()).padStart(2, '0')].join('-');
        }

        updateFilter(p, s, e);
    };

    const handleCustomFilter = () => {
        if (rangeStart && rangeEnd) {
            updateFilter('custom', rangeStart, rangeEnd);
        }
    };

    const totalUsers = analytics.totalUsers || 0;
    const totalPurchases = analytics.totalPurchases || 0;
    const totalRevenue = analytics.totalRevenue || 0;
    const dailySalesTotal = analytics.dailySalesTotal || 0;
    const weeklySalesTotal = analytics.weeklySalesTotal || 0;
    const monthlySalesTotal = analytics.monthlySalesTotal || 0;

    // Arrays sent from backend
    const dailyChart = analytics.dailyChart || [];
    const revenueTrend = analytics.revenueTrend || [];
    const dailyRevenueMap = analytics.dailyRevenueMap || {};

    const calendar = useMemo(() => {
        const [yRaw, mRaw] = String(calendarMonth || '').split('-');
        const y = Number(yRaw);
        const m = Number(mRaw);
        if (!y || !m) return null;

        const first = new Date(y, m - 1, 1);
        const last = new Date(y, m, 0);
        const startDay = first.getDay();
        const daysInMonth = last.getDate();
        const gridStart = new Date(y, m - 1, 1 - startDay);
        const cells = [];
        for (let i = 0; i < 42; i += 1) {
            const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            cells.push({
                key,
                date: d,
                inMonth: d.getMonth() === first.getMonth(),
                hasPurchase: (dailyRevenueMap[key] || 0) > 0,
            });
        }
        return { first, daysInMonth, cells };
    }, [calendarMonth, dailyRevenueMap]);

    const maxDaily = Math.max(...dailyChart.map((x) => x.value), 1);
    const maxTrend = Math.max(...revenueTrend.map((x) => x.value), 1);
    const trendPoints = revenueTrend
        .map((p, idx) => {
            const x = (idx / Math.max(revenueTrend.length - 1, 1)) * 100;
            const y = 100 - (p.value / maxTrend) * 100;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <AdminLayout
            title="Sales Overview"
            actions={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-slate-600">
                        Data analyst view for purchases and revenue
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge tone="blue">Moderator</Badge>
                    </div>
                </div>
            }
        >
            <Card className="mb-4 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="text-sm font-semibold">Filter tools</div>
                        <div className="mt-1 text-sm text-slate-600">Select a preset or choose a custom date range</div>
                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                        <Button
                            variant={preset === 'today' ? 'primary' : 'secondary'}
                            onClick={() => handlePresetChange('today')}
                        >
                            Today
                        </Button>
                        <Button
                            variant={preset === 'this_week' ? 'primary' : 'secondary'}
                            onClick={() => handlePresetChange('this_week')}
                        >
                            This Week
                        </Button>
                        <Button
                            variant={preset === 'this_month' ? 'primary' : 'secondary'}
                            onClick={() => handlePresetChange('this_month')}
                        >
                            This Month
                        </Button>
                        <div className="flex items-end gap-2">
                            <div>
                                <div className="text-xs font-semibold text-slate-600">Start</div>
                                <input
                                    type="date"
                                    value={rangeStart}
                                    onChange={(e) => setRangeStart(e.target.value)}
                                    className="mt-1 w-[160px] rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-900"
                                />
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-slate-600">End</div>
                                <input
                                    type="date"
                                    value={rangeEnd}
                                    onChange={(e) => {
                                        setRangeEnd(e.target.value);
                                        // Wait for state to update, then filter
                                        setTimeout(() => handleCustomFilter(), 50);
                                    }}
                                    onBlur={handleCustomFilter}
                                    className="mt-1 w-[160px] rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-900"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <Card className="p-5">
                            <div className="text-xs font-semibold text-slate-500">Total revenue</div>
                            <div className="mt-2 text-2xl font-semibold">{formatMoneyPHP(totalRevenue)}</div>
                            <div className="mt-1 text-sm text-slate-600">Completed purchases in range</div>
                        </Card>
                        <Card className="p-5">
                            <div className="text-xs font-semibold text-slate-500">Total purchases</div>
                            <div className="mt-2 text-2xl font-semibold">{totalPurchases}</div>
                            <div className="mt-1 text-sm text-slate-600">Completed purchases in range</div>
                        </Card>
                        <Card className="p-5">
                            <div className="text-xs font-semibold text-slate-500">Daily sales</div>
                            <div className="mt-2 text-2xl font-semibold">{formatMoneyPHP(dailySalesTotal)}</div>
                            <div className="mt-1 text-sm text-slate-600">Latest day in chart</div>
                        </Card>
                        <Card className="p-5">
                            <div className="text-xs font-semibold text-slate-500">Total users</div>
                            <div className="mt-2 text-2xl font-semibold">{totalUsers}</div>
                            <div className="mt-1 text-sm text-slate-600">Registered customers</div>
                        </Card>
                        <Card className="p-5">
                            <div className="text-xs font-semibold text-slate-500">Weekly sales</div>
                            <div className="mt-2 text-2xl font-semibold">{formatMoneyPHP(weeklySalesTotal)}</div>
                            <div className="mt-1 text-sm text-slate-600">Last 7 days in chart</div>
                        </Card>
                        <Card className="p-5">
                            <div className="text-xs font-semibold text-slate-500">Monthly sales</div>
                            <div className="mt-2 text-2xl font-semibold">{formatMoneyPHP(monthlySalesTotal)}</div>
                            <div className="mt-1 text-sm text-slate-600">Current month in trend</div>
                        </Card>
                        <Card className="p-5">
                            <div className="text-xs font-semibold text-slate-500">Range</div>
                            <div className="mt-2 text-sm font-semibold text-slate-900">
                                {rangeStart} — {rangeEnd}
                            </div>
                            <div className="mt-1 text-sm text-slate-600">Applied filter</div>
                        </Card>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <Card className="p-5 lg:col-span-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-semibold">Daily sales</div>
                                    <div className="text-sm text-slate-500">Bar chart (last 7 days of range)</div>
                                </div>
                                <Badge tone="blue">Bar</Badge>
                            </div>
                            <div className="mt-4 grid grid-cols-7 items-end gap-2">
                                {dailyChart.map((d) => (
                                    <div key={d.key} className="flex flex-col items-center gap-2">
                                        <div className="relative h-28 w-full rounded-xl bg-slate-100 ring-1 ring-slate-200 group">
                                            <div
                                                className="absolute bottom-0 w-full rounded-xl bg-slate-900 transition-all"
                                                style={{
                                                    height: `${Math.max(6, (d.value / maxDaily) * 100)}%`,
                                                    opacity: 0.22 + (d.value / maxDaily) * 0.6,
                                                }}
                                            />
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white group-hover:block z-10">
                                                {formatMoneyPHP(d.value)}
                                            </div>
                                        </div>
                                        <div className="text-[11px] font-medium text-slate-500">{d.label}</div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        <Card className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-semibold">Revenue trend</div>
                                    <div className="text-sm text-slate-500">Line chart (last 6 months)</div>
                                </div>
                                <Badge tone="purple">Line</Badge>
                            </div>
                            <div className="mt-4 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                                <svg viewBox="0 0 100 100" className="h-32 w-full overflow-visible">
                                    <polyline
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        className="text-slate-900"
                                        points={trendPoints}
                                    />
                                </svg>
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    {revenueTrend.slice(3).map((p) => (
                                        <div key={p.key} className="rounded-xl bg-white p-2 ring-1 ring-slate-200">
                                            <div className="text-[11px] font-semibold text-slate-500">{p.label}</div>
                                            <div className="mt-1 text-sm font-semibold text-slate-900">{formatMoneyPHP(p.value)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <Card className="p-5">
                        <div className="flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold">Calendar view</div>
                                <div className="text-sm text-slate-500">Purchase dates highlighted in green</div>
                            </div>
                            <input
                                type="month"
                                value={calendarMonth}
                                onChange={(e) => setCalendarMonth(e.target.value)}
                                className="rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-900"
                            />
                        </div>

                        <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold text-slate-500">
                            <div>Sun</div>
                            <div>Mon</div>
                            <div>Tue</div>
                            <div>Wed</div>
                            <div>Thu</div>
                            <div>Fri</div>
                            <div>Sat</div>
                        </div>

                        <div className="mt-2 grid grid-cols-7 gap-2">
                            {calendar?.cells?.map((c) => (
                                <div
                                    key={c.key}
                                    className={
                                        'rounded-xl p-2 text-center text-sm ring-1 ring-slate-200 ' +
                                        (c.inMonth ? 'bg-white' : 'bg-slate-50 opacity-60') +
                                        (c.hasPurchase ? ' bg-emerald-50 ring-emerald-200' : '')
                                    }
                                >
                                    <div className={c.hasPurchase ? 'font-semibold text-emerald-700' : 'text-slate-700'}>
                                        {c.date.getDate()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            <div className="mt-4" />
        </AdminLayout>
    );
}
