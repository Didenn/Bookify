import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/Admin/Badge';
import Button from '@/Components/Admin/Button';
import Card from '@/Components/Admin/Card';
import Modal from '@/Components/Admin/Modal';
import SelectField from '@/Components/Admin/SelectField';
import Table from '@/Components/Admin/Table';
import TextField from '@/Components/Admin/TextField';
import { useStaffList } from '@/hooks/staff/useStaffList';
import { useStaffMutations } from '@/hooks/staff/useStaffMutations';
import { useStaffForm } from '@/hooks/staff/useStaffForm';
import { useMemo, useState } from 'react';
import { toast, confirmAction } from '@/lib/ux';

function tone(role) {
    if (role === 'admin') return 'purple';
    if (role === 'moderator') return 'blue';
    return 'gray';
}

export default function StaffIndex() {
    const { rows, setRows, loading } = useStaffList();
    const [query, setQuery] = useState('');

    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const form = useStaffForm(null);
    const mutations = useStaffMutations({
        onCreated: (created) => {
            if (!created) return;
            setRows((prev) => [created, ...prev]);
        },
        onUpdated: (updated) => {
            if (!updated) return;
            setRows((prev) => prev.map((x) => (String(x.id) === String(updated.id) ? updated : x)));
        },
        onDeleted: (id) => {
            setRows((prev) => prev.filter((x) => String(x.id) !== String(id)));
        },
    });

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return rows.filter((r) => {
            if (!q) return true;
            return (
                String(r.name || '').toLowerCase().includes(q) ||
                String(r.email || '').toLowerCase().includes(q) ||
                String(r.id || '').toLowerCase().includes(q)
            );
        });
    }, [rows, query]);

    const columns = [
        {
            key: 'name',
            header: 'Account',
            render: (r) => (
                <div>
                    <div className="font-medium text-slate-900">{r.name}</div>
                    <div className="text-xs text-slate-500">{r.email}</div>
                </div>
            ),
        },
        { key: 'role', header: 'Role', render: (r) => <Badge tone={tone(r.role)}>{r.role}</Badge> },
        {
            key: 'actions',
            header: '',
            cellClassName: 'text-right',
            render: (r) => (
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            setSelected(r);
                            form.reset(r);
                            setEditOpen(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                            confirmAction({
                                title: 'Delete Staff',
                                message: `Delete ${r.email}?`,
                                onConfirm: async () => {
                                    const res = await mutations.deleteStaff(r.id);
                                    if (res.ok) toast(`Deleted: ${r.email}`);
                                }
                            });
                        }}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout
            title="Staff"
            actions={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-slate-600">Manage Admin / Moderator accounts (UI-only).</div>
                    <div className="flex items-center gap-2">
                        <div className="w-[320px] max-w-full">
                            <TextField label={null} value={query} onChange={setQuery} placeholder="Search staff" />
                        </div>
                        <Badge tone="purple">Super Admin</Badge>
                        <Button
                            onClick={() => {
                                mutations.clearErrors();
                                form.reset({ name: '', email: '', role: 'admin' });
                                setCreateOpen(true);
                            }}
                        >
                            Add staff
                        </Button>
                    </div>
                </div>
            }
        >
            <Table
                columns={columns}
                rows={filtered}
                onRowClick={(r) => {
                    setSelected(r);
                    form.reset(r);
                    setEditOpen(true);
                }}
            />

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="p-5">
                    <div className="text-sm font-semibold">Summary</div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                            <span>Total staff</span>
                            <span className="font-semibold text-slate-900">{rows.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Admins</span>
                            <span className="font-semibold text-slate-900">{rows.filter((r) => r.role === 'admin').length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Moderators</span>
                            <span className="font-semibold text-slate-900">{rows.filter((r) => r.role === 'moderator').length}</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold">Policies</div>
                            <div className="text-sm text-slate-500">Role-based access (UI-only)</div>
                        </div>
                        <Badge tone="blue">RBAC</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
                        <Button variant="secondary" onClick={() => toast('Role review started (mock).')}>
                            Review roles
                        </Button>
                        <Button variant="secondary" onClick={() => toast('Access report generated (mock).')}>
                            Access report
                        </Button>
                        <Button variant="secondary" onClick={() => toast('Invite link copied (mock).')}>
                            Copy invite
                        </Button>
                    </div>
                </Card>
            </div>

            <Modal open={createOpen} title="Add staff" description={null} onClose={() => setCreateOpen(false)}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <TextField label="Name" value={form.values.name} onChange={(v) => form.setField('name', v)} />
                    <TextField label="Email" value={form.values.email} onChange={(v) => form.setField('email', v)} />
                    <TextField label="Password" value={form.values.password} onChange={(v) => form.setField('password', v)} type="password" />
                    <SelectField
                        label="Role"
                        value={form.values.role}
                        onChange={(v) => form.setField('role', v)}
                        options={[
                            { label: 'admin', value: 'admin' },
                            { label: 'moderator', value: 'moderator' },
                        ]}
                    />
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setCreateOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        disabled={mutations.loading}
                        onClick={async () => {
                            const res = await mutations.createStaff(form.values);
                            if (!res.ok) return;
                            setCreateOpen(false);
                            toast(`Created: ${res.data.email}`);
                        }}
                    >
                        {mutations.loading ? 'Saving…' : 'Save'}
                    </Button>
                </div>
            </Modal>

            <Modal open={editOpen} title={`Edit ${selected?.email || ''}`} description={null} onClose={() => setEditOpen(false)}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <TextField label="Name" value={form.values.name} onChange={(v) => form.setField('name', v)} />
                    <TextField label="Email" value={form.values.email} onChange={(v) => form.setField('email', v)} />
                    <TextField
                        label="Password (optional)"
                        value={form.values.password}
                        onChange={(v) => form.setField('password', v)}
                        type="password"
                    />
                    <SelectField
                        label="Role"
                        value={form.values.role}
                        onChange={(v) => form.setField('role', v)}
                        options={[
                            { label: 'admin', value: 'admin' },
                            { label: 'moderator', value: 'moderator' },
                        ]}
                    />
                </div>
                <div className="mt-6 flex flex-wrap justify-between gap-2">
                    <Button
                        variant="danger"
                        disabled={mutations.loading}
                        onClick={() => {
                            if (!selected) return;
                            confirmAction({
                                title: 'Delete Staff',
                                message: `Delete ${selected.email}?`,
                                onConfirm: async () => {
                                    const res = await mutations.deleteStaff(selected.id);
                                    if (!res.ok) return;
                                    setEditOpen(false);
                                    toast(`Deleted: ${selected.email}`);
                                }
                            });
                        }}
                    >
                        Delete
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            disabled={mutations.loading}
                            onClick={async () => {
                                if (!selected) return;
                                const res = await mutations.updateStaff(selected.id, form.values);
                                if (!res.ok) return;
                                setEditOpen(false);
                                toast(`Saved: ${res.data.email}`);
                            }}
                        >
                            {mutations.loading ? 'Saving…' : 'Save'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
