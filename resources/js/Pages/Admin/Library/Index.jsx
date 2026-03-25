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

function tone(status) {
    if (status === 'published') return 'green';
    if (status === 'hidden') return 'gray';
    return 'gray';
}

export default function LibraryIndex() {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [detailOpen, setDetailOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [toast, setToast] = useState(null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return mockAdmin.library.filter((x) => {
            const matchesQ =
                !q ||
                x.title.toLowerCase().includes(q) ||
                x.author.toLowerCase().includes(q) ||
                x.id.toLowerCase().includes(q);
            const matchesStatus = status === 'all' ? true : x.status === status;
            return matchesQ && matchesStatus;
        });
    }, [query, status]);

    const columns = [
        {
            key: 'title',
            header: 'Title',
            render: (b) => (
                <div>
                    <div className="font-medium text-slate-900">{b.title}</div>
                    <div className="text-xs text-slate-500">{b.author}</div>
                </div>
            ),
        },
        { key: 'downloads', header: 'Downloads', render: (b) => <span className="font-medium">{b.downloads}</span> },
        { key: 'rating', header: 'Rating', render: (b) => <span className="font-medium">{b.rating}</span> },
        { key: 'status', header: 'Status', render: (b) => <Badge tone={tone(b.status)}>{b.status}</Badge> },
        {
            key: 'actions',
            header: '',
            cellClassName: 'text-right',
            render: (b) => (
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                            setSelected(b);
                            setDetailOpen(true);
                        }}
                    >
                        Details
                    </Button>
                    <Button
                        size="sm"
                        variant="subtle"
                        onClick={() => setToast({ type: 'success', message: `Republished (mock): ${b.title}` })}
                    >
                        Republish
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout
            title="Library"
            actions={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="w-[260px] max-w-full">
                            <TextField label={null} value={query} onChange={setQuery} placeholder="Search library" />
                        </div>
                        <div className="w-[220px] max-w-full">
                            <SelectField
                                label={null}
                                value={status}
                                onChange={setStatus}
                                options={[
                                    { label: 'All', value: 'all' },
                                    { label: 'Published', value: 'published' },
                                    { label: 'Hidden', value: 'hidden' },
                                ]}
                            />
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => setToast({ type: 'info', message: 'Metadata audit started (mock).' })}
                        >
                            Audit
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setToast({ type: 'info', message: 'Bulk hide/unhide opened (mock).' })}
                        >
                            Bulk
                        </Button>
                        <Button onClick={() => setToast({ type: 'success', message: 'Upload flow opened (mock).' })}>
                            Upload content
                        </Button>
                    </div>
                </div>
            }
        >
            {toast ? (
                <Card className="mb-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="text-sm font-semibold">Action</div>
                            <div className="mt-1 text-sm text-slate-600">{toast.message}</div>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => setToast(null)}>
                            Dismiss
                        </Button>
                    </div>
                </Card>
            ) : null}

            <Table
                columns={columns}
                rows={filtered}
                onRowClick={(b) => {
                    setSelected(b);
                    setDetailOpen(true);
                }}
            />

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="p-5">
                    <div className="text-sm font-semibold">Publishing</div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                            <span>Published</span>
                            <span className="font-semibold text-slate-900">
                                {mockAdmin.library.filter((x) => x.status === 'published').length}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Hidden</span>
                            <span className="font-semibold text-slate-900">
                                {mockAdmin.library.filter((x) => x.status === 'hidden').length}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Avg rating</span>
                            <span className="font-semibold text-slate-900">4.4</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold">Quality controls</div>
                            <div className="text-sm text-slate-500">Mock compliance</div>
                        </div>
                        <Badge tone="blue">QA</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
                        <Button
                            variant="secondary"
                            onClick={() => setToast({ type: 'info', message: 'Content scanning started (mock).' })}
                        >
                            Scan
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setToast({ type: 'info', message: 'DMCA takedown created (mock).' })}
                        >
                            Takedown
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setToast({ type: 'info', message: 'Featured list updated (mock).' })}
                        >
                            Feature
                        </Button>
                    </div>
                </Card>
            </div>

            <Modal
                open={detailOpen}
                title={selected ? selected.title : 'Details'}
                description={selected ? selected.id : ''}
                onClose={() => setDetailOpen(false)}
            >
                {selected ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                                <div className="text-xs font-semibold text-slate-600">Author</div>
                                <div className="mt-2 text-sm font-semibold text-slate-900">{selected.author}</div>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                                <div className="text-xs font-semibold text-slate-600">Status</div>
                                <div className="mt-2">
                                    <Badge tone={tone(selected.status)}>{selected.status}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <div className="text-xs font-semibold text-slate-600">Performance</div>
                            <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <div className="text-slate-500">Downloads</div>
                                    <div className="font-semibold text-slate-900">{selected.downloads}</div>
                                </div>
                                <div>
                                    <div className="text-slate-500">Rating</div>
                                    <div className="font-semibold text-slate-900">{selected.rating}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2">
                            <Button variant="secondary" onClick={() => setDetailOpen(false)}>
                                Close
                            </Button>
                            <Button
                                onClick={() => {
                                    setDetailOpen(false);
                                    setToast({ type: 'success', message: `Visibility updated (mock): ${selected.id}` });
                                }}
                            >
                                Toggle visibility
                            </Button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </AdminLayout>
    );
}
