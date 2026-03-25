import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/Admin/Badge';
import Button from '@/Components/Admin/Button';
import Card from '@/Components/Admin/Card';
import Modal from '@/Components/Admin/Modal';
import TextField from '@/Components/Admin/TextField';
import SelectField from '@/Components/Admin/SelectField';
import { mockAdmin } from '@/mock/adminData';
import { useState } from 'react';
import { toast, confirmAction } from '@/lib/ux';

export default function Profile() {
    const [editOpen, setEditOpen] = useState(false);

    const [form, setForm] = useState({
        name: mockAdmin.me.name,
        email: mockAdmin.me.email,
        role: mockAdmin.me.role,
        theme: 'Light',
    });

    return (
        <AdminLayout
            title="Profile"
            actions={
                <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">Admin account settings (UI-only)</div>
                    <div className="flex items-center gap-2">
                        <Badge tone="blue">Mock</Badge>
                        <Button onClick={() => setEditOpen(true)}>Edit profile</Button>
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="p-6 lg:col-span-2">
                    <div className="text-sm font-semibold">Account</div>
                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <div className="text-xs font-semibold text-slate-600">Name</div>
                            <div className="mt-2 text-sm font-semibold text-slate-900">{form.name}</div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <div className="text-xs font-semibold text-slate-600">Email</div>
                            <div className="mt-2 text-sm font-semibold text-slate-900">{form.email}</div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <div className="text-xs font-semibold text-slate-600">Role</div>
                            <div className="mt-2">
                                <Badge tone="purple">{form.role}</Badge>
                            </div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                            <div className="text-xs font-semibold text-slate-600">Theme</div>
                            <div className="mt-2 text-sm font-semibold text-slate-900">{form.theme}</div>
                        </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-200 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold">Security</div>
                                <div className="text-sm text-slate-500">UI-only actions</div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => toast('Password reset initiated (mock).')}
                                >
                                    Reset password
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => toast('Two-factor enabled (mock).')}
                                >
                                    Enable 2FA
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="text-sm font-semibold">Preferences</div>
                    <div className="mt-4 space-y-2">
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => toast('Notification sound toggled (mock).')}
                        >
                            Toggle sound
                        </Button>
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => toast('Email digest enabled (mock).')}
                        >
                            Email digest
                        </Button>
                        <Button
                            variant="danger"
                            className="w-full"
                            onClick={() => toast('Signed out (mock).')}
                        >
                            Sign out
                        </Button>
                    </div>

                    <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                        <div className="text-xs font-semibold text-slate-600">Tip</div>
                        <div className="mt-2 text-sm text-slate-700">
                            Use the sidebar to move between all modules. Every button is clickable (UI-only).
                        </div>
                    </div>
                </Card>
            </div>

            <Modal open={editOpen} title="Edit profile" description="Mock form" onClose={() => setEditOpen(false)}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <TextField label="Name" value={form.name} onChange={(v) => setForm((s) => ({ ...s, name: v }))} />
                    <TextField label="Email" value={form.email} onChange={(v) => setForm((s) => ({ ...s, email: v }))} />
                    <SelectField
                        label="Role"
                        value={form.role}
                        onChange={(v) => setForm((s) => ({ ...s, role: v }))}
                        options={['Super Admin', 'Admin', 'Support'].map((r) => ({ label: r, value: r }))}
                    />
                    <SelectField
                        label="Theme"
                        value={form.theme}
                        onChange={(v) => setForm((s) => ({ ...s, theme: v }))}
                        options={['Light', 'Dark'].map((t) => ({ label: t, value: t }))}
                    />
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setEditOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            setEditOpen(false);
                            toast('Profile saved (mock).');
                        }}
                    >
                        Save
                    </Button>
                </div>
            </Modal>
        </AdminLayout>
    );
}
