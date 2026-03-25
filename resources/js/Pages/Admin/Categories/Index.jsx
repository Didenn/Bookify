import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/Admin/Badge';
import Button from '@/Components/Admin/Button';
import Card from '@/Components/Admin/Card';
import Modal from '@/Components/Admin/Modal';
import Table from '@/Components/Admin/Table';
import TextField from '@/Components/Admin/TextField';
import SelectField from '@/Components/Admin/SelectField';
import { useCategoriesList } from '@/hooks/categories/useCategoriesList';
import { useCategoryMutations } from '@/hooks/categories/useCategoryMutations';
import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast, confirmAction } from '@/lib/ux';

function tone(status) {
    if (status === 'active') return 'green';
    return 'gray';
}

export default function CategoriesIndex() {
    const [query, setQuery] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const { rows, setRows } = useCategoriesList();
    const { loading: mutating, errors, createCategory, updateCategory, deleteCategory, clearErrors } =
        useCategoryMutations({
            onCreated: (next) => setRows((prev) => [next, ...prev]),
            onUpdated: (next) => setRows((prev) => prev.map((x) => (x.id === next.id ? next : x))),
            onDeleted: (id) => setRows((prev) => prev.filter((x) => x.id !== id)),
        });

    const [form, setForm] = useState({ id: '', name: '', status: 'active' });

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return rows.filter((c) => !q || String(c.name || '').toLowerCase().includes(q));
    }, [query, rows]);

    const columns = [
        {
            key: 'name',
            header: 'Category',
            render: (c) => (
                <div>
                    <div className="font-medium text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.id}</div>
                </div>
            ),
        },
        { key: 'products', header: 'Products', render: (c) => <span className="font-medium">{c.products}</span> },
        {
            key: 'status',
            header: 'Status',
            render: (c) => <Badge tone={tone(c.status)}>{c.status}</Badge>,
        },
        {
            key: 'actions',
            header: '',
            cellClassName: 'text-right',
            render: (c) => (
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            setSelected(c);
                            setForm({ id: c.id, name: c.name, status: c.status });
                            clearErrors();
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
                                title: 'Delete Category',
                                message: `Delete category ${c.name}?`,
                                onConfirm: async () => {
                                    const res = await deleteCategory(c.id);
                                    if (res.ok) toast('Deleted successfully');
                                    else toast(res?.errors?._error?.[0] || 'Delete failed', 'error');
                                }
                            });
                        }}
                    >
                        Delete
                    </Button>
                    <Link href={route('admin.products.index')}>
                        <Button variant="subtle" size="sm">
                            View products
                        </Button>
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout
            title="Categories"
            actions={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-[260px] max-w-full">
                            <TextField
                                label={null}
                                value={query}
                                onChange={setQuery}
                                placeholder="Search categories"
                            />
                        </div>
                        <Link href={route('admin.products.index')}>
                            <Button variant="secondary">Back to products</Button>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => {
                                setForm({ id: '', name: '', status: 'active' });
                                clearErrors();
                                setCreateOpen(true);
                            }}
                        >
                            Add category
                        </Button>
                    </div>
                </div>
            }
        >
            {errors ? (
                <Card className="mb-4 p-4">
                    <div className="text-sm font-semibold text-rose-700">Request failed</div>
                    <div className="mt-1 text-sm text-rose-700">
                        {errors?._error?.[0] || errors?.category?.[0] || 'Please try again.'}
                    </div>
                </Card>
            ) : null}

            <Table columns={columns} rows={filtered} />

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="p-5">
                    <div className="text-sm font-semibold">Summary</div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                            <span>Total categories</span>
                            <span className="font-semibold text-slate-900">{rows.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Active</span>
                            <span className="font-semibold text-slate-900">
                                {rows.filter((c) => c.status === 'active').length}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            <Modal
                open={createOpen}
                title="Add category"
                description="Create a new category."
                onClose={() => setCreateOpen(false)}
            >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <TextField
                        label="Name"
                        value={form.name}
                        onChange={(v) => setForm((s) => ({ ...s, name: v }))}
                        placeholder="e.g. Fiction"
                    />
                    <SelectField
                        label="Status"
                        value={form.status}
                        onChange={(v) => setForm((s) => ({ ...s, status: v }))}
                        options={['active', 'inactive'].map((s) => ({ label: s, value: s }))}
                    />
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-2">
                    <Button variant="secondary" onClick={() => setCreateOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            (async () => {
                                const nextId = form.id?.trim() || `C-${String(Date.now()).slice(-4)}`;
                                const res = await createCategory({ id: nextId, name: form.name, status: form.status });
                                if (!res.ok) return;
                                setCreateOpen(false);
                                toast(`Category created: ${form.name || '(unnamed)'}`);
                            })();
                        }}
                        disabled={mutating}
                    >
                        Save
                    </Button>
                </div>
            </Modal>

            <Modal
                open={editOpen}
                title={`Edit category ${selected?.id || ''}`}
                description="Update category details."
                onClose={() => setEditOpen(false)}
            >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <TextField
                        label="Name"
                        value={form.name}
                        onChange={(v) => setForm((s) => ({ ...s, name: v }))}
                        placeholder="e.g. Fiction"
                    />
                    <SelectField
                        label="Status"
                        value={form.status}
                        onChange={(v) => setForm((s) => ({ ...s, status: v }))}
                        options={['active', 'inactive'].map((s) => ({ label: s, value: s }))}
                    />
                </div>

                <div className="mt-6 flex flex-wrap justify-between gap-2">
                    <div />
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                (async () => {
                                    if (!selected) return;
                                    const res = await updateCategory(selected.id, {
                                        name: form.name,
                                        status: form.status,
                                    });
                                    if (!res.ok) return;
                                    setEditOpen(false);
                                    toast(`Saved changes: ${selected?.name}`);
                                })();
                            }}
                            disabled={mutating}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
