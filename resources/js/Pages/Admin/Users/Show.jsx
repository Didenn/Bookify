import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/Admin/Badge';
import Button from '@/Components/Admin/Button';
import Card from '@/Components/Admin/Card';
import Modal from '@/Components/Admin/Modal';
import SelectField from '@/Components/Admin/SelectField';
import TextField from '@/Components/Admin/TextField';
import { mockAdmin } from '@/mock/adminData';
import { Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast, confirmAction } from '@/lib/ux';

function tone(status) {
    if (status === 'active') return 'green';
    if (status === 'inactive') return 'gray';
    return 'gray';
}

export default function UsersShow() {
    const { props } = usePage();
    const userId = props.userId;

    const user = useMemo(() => mockAdmin.users.find((u) => u.id === userId), [userId]);

    const [status, setStatus] = useState(user?.status || 'active');
    const [noteOpen, setNoteOpen] = useState(false);
    const [note, setNote] = useState('');

    if (!user) {
        return (
            <AdminLayout title="User not found">
                <Card className="p-6">
                    <div className="text-sm font-semibold">User not found</div>
                    <div className="mt-1 text-sm text-slate-600">
                        The requested user does not exist in mock data.
                    </div>
                    <div className="mt-4">
                        <Link href={route('admin.users.index')}>
                            <Button variant="secondary">Back to users</Button>
                        </Link>
                    </div>
                </Card>
            </AdminLayout>
        );
    }

    const userOrders = mockAdmin.orders.filter((o) => o.userId === user.id);

    return (
        <AdminLayout
            title={user.name}
            actions={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Link href={route('admin.users.index')}>
                            <Button variant="secondary">Back</Button>
                        </Link>
                        <Badge tone={tone(status)}>{status}</Badge>
                        <div className="text-sm text-slate-600">Joined {user.joinedAt}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => toast(`Email sent (mock) to ${user.email}.`)}
                        >
                            Email
                        </Button>
                        <Button onClick={() => setNoteOpen(true)}>Add note</Button>
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="p-5 lg:col-span-2">
                    <div className="text-sm font-semibold">Profile</div>
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <div className="text-xs font-semibold text-slate-600">Email</div>
                            <div className="mt-2 text-sm font-semibold text-slate-900">{user.email}</div>
                            <div className="mt-1 text-sm text-slate-600">Last seen {user.lastSeenAt}</div>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <div className="text-xs font-semibold text-slate-600">Purchases</div>
                            <div className="mt-2 text-2xl font-semibold text-slate-900">{user.purchases}</div>
                            <div className="mt-1 text-sm text-slate-600">Lifetime orders</div>
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold">Account status</div>
                                <div className="text-sm text-slate-500">UI-only controls</div>
                            </div>
                            <div className="w-[240px]">
                                <SelectField
                                    label={null}
                                    value={status}
                                    onChange={setStatus}
                                    options={['active', 'inactive'].map((s) => ({ label: s, value: s }))}
                                />
                            </div>
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => toast('Two-factor reset (mock).')}
                            >
                                Reset 2FA
                            </Button>
                            <Button
                                onClick={() => toast(`Status saved (mock): ${status}`)}
                            >
                                Save
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 p-4">
                        <div className="text-sm font-semibold">Orders</div>
                        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                            {userOrders.length ? (
                                userOrders.map((o) => (
                                    <Link
                                        key={o.id}
                                        href={route('admin.orders.show', { orderId: o.id })}
                                        className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200 hover:bg-white"
                                    >
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">{o.id}</div>
                                            <div className="text-xs text-slate-500">{o.createdAt}</div>
                                        </div>
                                        <Badge
                                            tone={o.status === 'completed' ? 'green' : o.status === 'pending' ? 'yellow' : 'red'}
                                        >
                                            {o.status}
                                        </Badge>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-sm text-slate-600">No orders found in mock data.</div>
                            )}
                        </div>
                    </div>
                </Card>

                <Card className="p-5">
                    <div className="text-sm font-semibold">Actions</div>
                    <div className="mt-4 space-y-2">
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => toast('User blocked (mock).')}
                        >
                            Block user
                        </Button>
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => toast('User unblocked (mock).')}
                        >
                            Unblock
                        </Button>
                        <Button
                            variant="danger"
                            className="w-full"
                            onClick={() => confirmAction({ title: 'Delete account', message: 'Delete this user? (Mock)', onConfirm: () => toast('Account deleted (mock).') })}
                        >
                            Delete account
                        </Button>
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                        <div className="text-xs font-semibold text-slate-600">Internal note</div>
                        <div className="mt-2 text-sm text-slate-700">
                            {note ? note : 'No notes yet. Use “Add note”.'}
                        </div>
                    </div>
                </Card>
            </div>

            <Modal open={noteOpen} title="Internal note" description="Mock note" onClose={() => setNoteOpen(false)}>
                <TextField label="Note" value={note} onChange={setNote} placeholder="e.g. VIP customer" />
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setNoteOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            setNoteOpen(false);
                            toast('Note saved (mock).');
                        }}
                    >
                        Save
                    </Button>
                </div>
            </Modal>
        </AdminLayout>
    );
}
