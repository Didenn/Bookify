import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/Admin/Badge';
import Button from '@/Components/Admin/Button';
import Card from '@/Components/Admin/Card';
import Modal from '@/Components/Admin/Modal';
import Table from '@/Components/Admin/Table';
import TextField from '@/Components/Admin/TextField';
import SelectField from '@/Components/Admin/SelectField';
import { mockAdmin } from '@/mock/adminData';
import { useMemo, useState } from 'react';
import { toast, confirmAction } from '@/lib/ux';

function tone(priority) {
    if (priority === 'high') return 'red';
    if (priority === 'medium') return 'yellow';
    return 'gray';
}

export default function WishlistIndex() {
    const [query, setQuery] = useState('');
    const [detailOpen, setDetailOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return mockAdmin.wishlist.filter((w) => {
            const matchesQ =
                !q ||
                w.user.toLowerCase().includes(q) ||
                w.product.toLowerCase().includes(q) ||
                w.id.toLowerCase().includes(q);
            const matchesP = priority === 'all' ? true : w.priority === priority;
            return matchesQ && matchesP;
        });
    }, [query, priority]);

    const columns = [
        {
            key: 'product',
            header: 'Wishlist item',
            render: (w) => (
                <div>
                    <div className="font-medium text-slate-900">{w.product}</div>
                    <div className="text-xs text-slate-500">Added by {w.user}</div>
                </div>
            ),
        },
        { key: 'addedAt', header: 'Added' },
        { key: 'priority', header: 'Priority', render: (w) => <Badge tone={tone(w.priority)}>{w.priority}</Badge> },
        {
            key: 'actions',
            header: '',
            cellClassName: 'text-right',
            render: (w) => (
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                            setSelected(w);
                            setDetailOpen(true);
                        }}
                    >
                        Details
                    </Button>
                    <Button
                        size="sm"
                        variant="subtle"
                        onClick={() => toast(`Promo sent (mock) to ${w.user}.`)}
                    >
                        Promote
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout
            title="Wishlist"
            actions={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="w-[260px] max-w-full">
                            <TextField label={null} value={query} onChange={setQuery} placeholder="Search wishlist" />
                        </div>
                        <div className="w-[220px] max-w-full">
                            <SelectField
                                label={null}
                                value={priority}
                                onChange={setPriority}
                                options={[
                                    { label: 'All', value: 'all' },
                                    { label: 'High', value: 'high' },
                                    { label: 'Medium', value: 'medium' },
                                    { label: 'Low', value: 'low' },
                                ]}
                            />
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => toast('Wishlist trends opened (mock).')}
                        >
                            Trends
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => toast('Top wished products exported (mock).')}
                        >
                            Export
                        </Button>
                        <Button onClick={() => toast('Auto-promo rule created (mock).')}>
                            Create rule
                        </Button>
                    </div>
                </div>
            }
        >
            <Table
                columns={columns}
                rows={filtered}
                onRowClick={(w) => {
                    setSelected(w);
                    setDetailOpen(true);
                }}
            />

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="p-5">
                    <div className="text-sm font-semibold">Signals</div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                            <span>Total wishlist items</span>
                            <span className="font-semibold text-slate-900">{mockAdmin.wishlist.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>High priority</span>
                            <span className="font-semibold text-slate-900">
                                {mockAdmin.wishlist.filter((w) => w.priority === 'high').length}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Promo conversions</span>
                            <span className="font-semibold text-slate-900">Mock</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold">Retention ideas</div>
                            <div className="text-sm text-slate-500">Mock workflows</div>
                        </div>
                        <Badge tone="blue">Ideas</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
                        <Button
                            variant="secondary"
                            onClick={() => toast('Price drop alerts enabled (mock).')}
                        >
                            Price drop alerts
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => toast('Bundle campaign created (mock).')}
                        >
                            Bundle campaign
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => toast('New releases push created (mock).')}
                        >
                            New releases
                        </Button>
                    </div>
                </Card>
            </div>

            <Modal
                open={detailOpen}
                title={selected ? selected.product : 'Details'}
                description={selected ? selected.id : ''}
                onClose={() => setDetailOpen(false)}
            >
                {selected ? (
                    <div className="space-y-4">
                        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <div className="text-xs font-semibold text-slate-600">User</div>
                            <div className="mt-2 text-sm font-semibold text-slate-900">{selected.user}</div>
                            <div className="mt-1 text-sm text-slate-600">Added {selected.addedAt}</div>
                            <div className="mt-3">
                                <Badge tone={tone(selected.priority)}>{selected.priority} priority</Badge>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2">
                            <Button variant="secondary" onClick={() => setDetailOpen(false)}>
                                Close
                            </Button>
                            <Button
                                onClick={() => {
                                    setDetailOpen(false);
                                    toast(`Offer sent (mock) for ${selected.product}.`);
                                }}
                            >
                                Send offer
                            </Button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </AdminLayout>
    );
}
