import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/Admin/Badge';
import Button from '@/Components/Admin/Button';
import Card from '@/Components/Admin/Card';
import Modal from '@/Components/Admin/Modal';
import Table from '@/Components/Admin/Table';
import TextField from '@/Components/Admin/TextField';
import SelectField from '@/Components/Admin/SelectField';
import { mockAdmin } from '@/mock/adminData';
import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast, confirmAction } from '@/lib/ux';

function tone(status) {
    if (status === 'active') return 'green';
    if (status === 'inactive') return 'gray';
    return 'gray';
}

export default function UsersIndex() {
    const [query, setQuery] = useState('');
    const [broadcastOpen, setBroadcastOpen] = useState(false);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return mockAdmin.users.filter((u) => {
            const matchesQ =
                !q ||
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                u.id.toLowerCase().includes(q);
            const matchesStatus = status === 'all' ? true : u.status === status;
            return matchesQ && matchesStatus;
        });
    }, [query, status]);

    const columns = [
        {
            key: 'name',
            header: 'User',
            render: (u) => (
                <div>
                    <div className="font-medium text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                </div>
            ),
        },
        { key: 'id', header: 'ID', render: (u) => <span className="text-xs font-semibold">{u.id}</span> },
        { key: 'joinedAt', header: 'Joined' },
        { key: 'lastSeenAt', header: 'Last seen' },
        { key: 'purchases', header: 'Purchases', render: (u) => <span className="font-medium">{u.purchases}</span> },
        { key: 'status', header: 'Status', render: (u) => <Badge tone={tone(u.status)}>{u.status}</Badge> },
        {
            key: 'actions',
            header: '',
            cellClassName: 'text-right',
            render: (u) => (
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link href={route('admin.users.show', { userId: u.id })}>
                        <Button size="sm" variant="secondary">
                            Details
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        variant="subtle"
                        onClick={() => toast(`Password reset sent (mock) to ${u.email}.`)}
                    >
                        Reset
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout
            title="Users"
            actions={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="w-[260px] max-w-full">
                            <TextField label={null} value={query} onChange={setQuery} placeholder="Search users" />
                        </div>
                        <div className="w-[220px] max-w-full">
                            <SelectField
                                label={null}
                                value={status}
                                onChange={setStatus}
                                options={[
                                    { label: 'All', value: 'all' },
                                    { label: 'Active', value: 'active' },
                                    { label: 'Inactive', value: 'inactive' },
                                ]}
                            />
                        </div>
                        <Button variant="secondary" onClick={() => setBroadcastOpen(true)}>
                            Broadcast
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('admin.notifications.index')}>
                            <Button variant="secondary">Send notification</Button>
                        </Link>
                        <Button
                            onClick={() => toast('User invite created (mock). Share link via email.')}
                        >
                            Invite user
                        </Button>
                    </div>
                </div>
            }
        >
            <Table
                columns={columns}
                rows={filtered}
                onRowClick={(u) => {
                    window.location.href = route('admin.users.show', { userId: u.id });
                }}
            />

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="p-5">
                    <div className="text-sm font-semibold">User activity</div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                            <span>Active users</span>
                            <span className="font-semibold text-slate-900">
                                {mockAdmin.users.filter((u) => u.status === 'active').length}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Inactive users</span>
                            <span className="font-semibold text-slate-900">
                                {mockAdmin.users.filter((u) => u.status === 'inactive').length}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Avg purchases</span>
                            <span className="font-semibold text-slate-900">3.0</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold">Moderation</div>
                            <div className="text-sm text-slate-500">UI-only safeguards</div>
                        </div>
                        <Badge tone="blue">Policy</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
                        <Button
                            variant="secondary"
                            onClick={() => toast('Flagged users panel opened (mock).')}
                        >
                            Flagged
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => toast('Role changes opened (mock).')}
                        >
                            Roles
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => toast('Export compliance report (mock).')}
                        >
                            Compliance
                        </Button>
                    </div>
                </Card>
            </div>

            <Modal
                open={broadcastOpen}
                title="Broadcast message"
                description="Mock: compose a message to all users"
                onClose={() => setBroadcastOpen(false)}
            >
                <TextField label="Title" value={toast?.title || ''} onChange={() => {}} placeholder="System update" />
                <div className="mt-4">
                    <TextField label="Message" value={toast?.body || ''} onChange={() => {}} placeholder="Message (UI-only)" />
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setBroadcastOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            setBroadcastOpen(false);
                            toast('Broadcast scheduled (mock).');
                        }}
                    >
                        Schedule
                    </Button>
                </div>
            </Modal>
        </AdminLayout>
    );
}
