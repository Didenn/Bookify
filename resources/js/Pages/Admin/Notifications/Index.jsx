import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/Admin/Badge';
import Button from '@/Components/Admin/Button';
import Card from '@/Components/Admin/Card';
import Table from '@/Components/Admin/Table';
import TextField from '@/Components/Admin/TextField';
import { useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { toast, confirmAction } from '@/lib/ux';

export default function NotificationsIndex() {
    const [query, setQuery] = useState('');
    const page = usePage();
    const initialDrafts = Array.isArray(page?.props?.drafts) ? page.props.drafts : [];
    const initialSent = Array.isArray(page?.props?.sent) ? page.props.sent : [];

    const [drafts, setDrafts] = useState(initialDrafts);
    const [sent, setSent] = useState(initialSent);
    const [editId, setEditId] = useState(null);
    const [edit, setEdit] = useState({ title: '', message: '' });
    const [busyId, setBusyId] = useState(null);
    const [actionError, setActionError] = useState(null);

    useEffect(() => {
        setDrafts(initialDrafts);
    }, [initialDrafts]);

    useEffect(() => {
        setSent(initialSent);
    }, [initialSent]);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        message: '',
    });

    const filterByQuery = useMemo(() => {
        const q = query.trim().toLowerCase();
        return (rows) => rows.filter((n) => {
            const matchesQ =
                !q ||
                String(n.title || '').toLowerCase().includes(q) ||
                String(n.message || '').toLowerCase().includes(q);
            return matchesQ;
        });
    }, [query]);

    const filteredDrafts = useMemo(() => filterByQuery(drafts), [filterByQuery, drafts]);
    const filteredSent = useMemo(() => filterByQuery(sent), [filterByQuery, sent]);

    async function updateDraft(id) {
        setBusyId(id);
        setActionError(null);
        try {
            const res = await window.axios.put(route('admin.notifications.update', id), {
                title: edit.title,
                message: edit.message,
            });
            const next = res?.data?.data;
            setDrafts((prev) => prev.map((x) => (String(x.id) === String(id) ? next : x)));
            setEditId(null);
            setEdit({ title: '', message: '' });
        } catch (e) {
            setActionError(e?.response?.data?.message || e?.message || 'Update failed.');
        } finally {
            setBusyId(null);
        }
    }

    async function sendDraft(id) {
        setBusyId(id);
        setActionError(null);
        try {
            const res = await window.axios.post(route('admin.notifications.send', id));
            const next = res?.data?.data;
            setDrafts((prev) => prev.filter((x) => String(x.id) !== String(id)));
            setSent((prev) => [next, ...prev]);
        } catch (e) {
            setActionError(e?.response?.data?.message || e?.message || 'Send failed.');
        } finally {
            setBusyId(null);
        }
    }

    async function deleteNotification(id, status) {
        setBusyId(id);
        setActionError(null);
        try {
            await window.axios.delete(route('admin.notifications.destroy', id));
            if (status === 'draft') {
                setDrafts((prev) => prev.filter((x) => String(x.id) !== String(id)));
            } else {
                setSent((prev) => prev.filter((x) => String(x.id) !== String(id)));
            }
        } catch (e) {
            setActionError(e?.response?.data?.message || e?.message || 'Delete failed.');
        } finally {
            setBusyId(null);
        }
    }

    const draftColumns = [
        {
            key: 'title',
            header: 'Notification',
            render: (n) => (
                <div>
                    <div className="font-medium text-slate-900">{n.title}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{n.message}</div>
                </div>
            ),
        },
        { key: 'createdAt', header: 'Created' },
        {
            key: 'actions',
            header: '',
            cellClassName: 'text-right',
            render: (n) => (
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                        size="sm"
                        variant="secondary"
                        disabled={busyId === n.id}
                        onClick={() => {
                            setActionError(null);
                            setEditId(n.id);
                            setEdit({ title: n.title || '', message: n.message || '' });
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="subtle"
                        disabled={busyId === n.id}
                        onClick={() => {
                            confirmAction({
                                title: 'Send Notification',
                                message: 'Are you sure you want to send this notification?',
                                onConfirm: () => sendDraft(n.id)
                            });
                        }}
                    >
                        Send
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        disabled={busyId === n.id}
                        onClick={() => {
                            confirmAction({
                                title: 'Delete Draft',
                                message: 'Delete this draft notification?',
                                onConfirm: () => deleteNotification(n.id, 'draft')
                            });
                        }}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    const sentColumns = [
        {
            key: 'title',
            header: 'Notification',
            render: (n) => (
                <div>
                    <div className="font-medium text-slate-900">{n.title}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{n.message}</div>
                </div>
            ),
        },
        { key: 'createdAt', header: 'Created' },
        {
            key: 'actions',
            header: '',
            cellClassName: 'text-right',
            render: (n) => (
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <Button
                        size="sm"
                        variant="danger"
                        disabled={busyId === n.id}
                        onClick={() => {
                            confirmAction({
                                title: 'Delete Notification',
                                message: 'Delete this sent notification?',
                                onConfirm: () => deleteNotification(n.id, 'sent')
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
            title="Notification Management"
            actions={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="w-[260px] max-w-full">
                            <TextField label={null} value={query} onChange={setQuery} placeholder="Search notifications" />
                        </div>
                    </div>
                </div>
            }
        >
            <Card className="mb-4 p-5">
                <div className="text-sm font-semibold">Create notification</div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <TextField
                        label="Title"
                        value={data.title}
                        onChange={(v) => setData('title', v)}
                        placeholder="Weekend Sale"
                    />
                    <div className="md:col-span-2">
                        <label className="block">
                            <div className="text-xs font-semibold text-slate-600">Message</div>
                            <textarea
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                placeholder="Message content..."
                                rows={4}
                                className="mt-2 w-full rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900"
                            />
                        </label>
                    </div>
                </div>

                {errors?.title || errors?.message ? (
                    <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
                        {errors?.title ? <div>{errors.title}</div> : null}
                        {errors?.message ? <div>{errors.message}</div> : null}
                    </div>
                ) : null}

                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => reset()} disabled={processing}>
                        Clear
                    </Button>
                    <Button
                        onClick={() => {
                            post(route('admin.notifications.store'), {
                                preserveScroll: true,
                                onSuccess: () => reset(),
                            });
                        }}
                        disabled={processing}
                    >
                        Save draft
                    </Button>
                </div>
            </Card>

            {actionError ? (
                <Card className="mb-4 p-4">
                    <div className="text-sm font-semibold text-rose-700">Request failed</div>
                    <div className="mt-1 text-sm text-rose-700">{actionError}</div>
                </Card>
            ) : null}

            {editId ? (
                <Card className="mb-4 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <div className="text-sm font-semibold">Edit draft</div>
                            <div className="mt-1 text-sm text-slate-500">Draft only</div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                disabled={busyId === editId}
                                onClick={() => {
                                    setEditId(null);
                                    setEdit({ title: '', message: '' });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button disabled={busyId === editId} onClick={() => updateDraft(editId)}>
                                Save
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <TextField
                            label="Title"
                            value={edit.title}
                            onChange={(v) => setEdit((s) => ({ ...s, title: v }))}
                            placeholder="Weekend Sale"
                        />
                        <div className="md:col-span-2">
                            <label className="block">
                                <div className="text-xs font-semibold text-slate-600">Message</div>
                                <textarea
                                    value={edit.message}
                                    onChange={(e) => setEdit((s) => ({ ...s, message: e.target.value }))}
                                    placeholder="Message content..."
                                    rows={4}
                                    className="mt-2 w-full rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900"
                                />
                            </label>
                        </div>
                    </div>
                </Card>
            ) : null}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold">Drafts</div>
                            <div className="text-sm text-slate-500">Edit, send, or delete</div>
                        </div>
                        <Badge tone="gray">{filteredDrafts.length}</Badge>
                    </div>
                    <div className="mt-4">
                        <Table columns={draftColumns} rows={filteredDrafts} />
                    </div>
                </Card>

                <Card className="p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold">Sent</div>
                            <div className="text-sm text-slate-500">Delete only</div>
                        </div>
                        <Badge tone="green">{filteredSent.length}</Badge>
                    </div>
                    <div className="mt-4">
                        <Table columns={sentColumns} rows={filteredSent} />
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}
