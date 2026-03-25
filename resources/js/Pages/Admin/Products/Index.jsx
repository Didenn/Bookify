import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/Admin/Badge';
import Button from '@/Components/Admin/Button';
import Card from '@/Components/Admin/Card';
import Modal from '@/Components/Admin/Modal';
import TextField from '@/Components/Admin/TextField';
import SelectField from '@/Components/Admin/SelectField';
import { formatMoneyPHP } from '@/mock/adminData';
import { useCategoriesList } from '@/hooks/categories/useCategoriesList';
import { useProductsList } from '@/hooks/products/useProductsList';
import { useProductMutations } from '@/hooks/products/useProductMutations';
import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast, confirmAction } from '@/lib/ux';

function typeLabel(deliveryType) {
    if (deliveryType === 'LINK') return 'Link';
    if (deliveryType === 'FILE') return 'File';
    return '—';
}

function ProductCardPreview({ title, src, description, category, price }) {
    return (
        <Card className="p-6">
            <div className="text-base font-semibold text-slate-900">{title || 'Untitled product'}</div>
            <CardImage title={title} src={src} />
            <div className="mt-3 text-sm text-slate-600">{description || ''}</div>

            <div className="mt-4 flex items-center justify-between">
                <div>
                    <div className="text-xs font-semibold text-slate-500">Category</div>
                    <div className="text-sm font-medium text-slate-900">{category || '—'}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs font-semibold text-slate-500">Price</div>
                    <div className="text-lg font-bold text-slate-900">{formatMoneyPHP(price)}</div>
                </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
                <Button variant="secondary" size="sm" disabled>
                    Edit
                </Button>
                <Button variant="danger" size="sm" disabled>
                    Delete
                </Button>
            </div>
        </Card>
    );
}

function CardImage({ title, src }) {
    if (src) {
        return (
            <div className="mt-3 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                <img src={src} alt={title || 'Product'} className="h-56 w-full object-cover" />
            </div>
        );
    }

    return (
        <div className="mt-3 grid h-56 w-full place-items-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
            <span className="text-xs font-semibold">No image</span>
        </div>
    );
}

function typeTone(deliveryType) {
    if (deliveryType === 'LINK') return 'blue';
    if (deliveryType === 'FILE') return 'purple';
    return 'gray';
}

function Thumb({ title, thumbnail }) {
    if (thumbnail) {
        return (
            <div className="h-12 w-12 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                <div className="grid h-full w-full place-items-center text-xs font-semibold text-slate-700">
                    IMG
                </div>
            </div>
        );
    }

    return (
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
            <span className="text-xs font-bold">{String(title || 'P').slice(0, 1).toUpperCase()}</span>
        </div>
    );
}

export default function ProductsIndex() {
    const [query, setQuery] = useState('');
    const [categoryId, setCategoryId] = useState('all');
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const { rows: categories } = useCategoriesList();
    const { rows: products, setRows: setProducts } = useProductsList();
    const { loading: mutating, errors, createProduct, updateProduct, deleteProduct, clearErrors } =
        useProductMutations({
            onCreated: (next) => setProducts((prev) => [next, ...prev]),
            onUpdated: (next) => setProducts((prev) => prev.map((x) => (x.id === next.id ? next : x))),
            onDeleted: (id) => setProducts((prev) => prev.filter((x) => x.id !== id)),
        });

    const activeCategories = useMemo(
        () => categories.filter((c) => c.status === 'active'),
        [categories],
    );

    const [form, setForm] = useState({
        id: '',
        title: '',
        description: '',
        type: '',
        category_id: '',
        price: '0',
        thumbnail_path: '',
        thumbnail: null,
        thumbnail_preview: '',
        delivery_type: 'LINK',
        file_link: '',
        upload_file_name: '',
        product_file: null,
    });

    const selectedCategoryName = useMemo(() => {
        const found = activeCategories.find((c) => String(c.id) === String(form.category_id));
        return found?.name || '';
    }, [activeCategories, form.category_id]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return products.filter((p) => {
            const matchesQ =
                !q ||
                String(p.title || '').toLowerCase().includes(q) ||
                String(p.id || '').toLowerCase().includes(q);

            const matchesCat = categoryId === 'all' ? true : String(p.category_id) === String(categoryId);

            return matchesQ && matchesCat;
        });
    }, [query, categoryId, products]);

    return (
        <AdminLayout
            title="Products"
            actions={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="w-[260px] max-w-full">
                            <TextField
                                label={null}
                                value={query}
                                onChange={setQuery}
                                placeholder="Search products (title, ID)"
                            />
                        </div>
                        <div className="w-[220px] max-w-full">
                            <SelectField
                                label={null}
                                value={categoryId}
                                onChange={setCategoryId}
                                options={[
                                    { label: 'All categories', value: 'all' },
                                    ...activeCategories.map((c) => ({ label: c.name, value: c.id })),
                                ]}
                            />
                        </div>
                        <Link href={window.route('admin.categories.index')}>
                            <Button variant="secondary">Manage categories</Button>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => {
                                clearErrors();
                                const fallbackCatId = activeCategories[0]?.id || '';
                                setForm({
                                    id: '',
                                    title: '',
                                    description: '',
                                    type: 'Digital',
                                    category_id: fallbackCatId,
                                    price: '199',
                                    thumbnail_path: '',
                                    thumbnail: null,
                                    thumbnail_preview: '',
                                    delivery_type: 'LINK',
                                    file_link: '',
                                    upload_file_name: '',
                                    product_file: null,
                                });
                                setCreateOpen(true);
                            }}
                        >
                            Add product
                        </Button>
                    </div>
                </div>
            }
        >

            {errors ? (
                <Card className="mb-4 p-4">
                    <div className="text-sm font-semibold text-rose-700">Request failed</div>
                    <div className="mt-1 text-sm text-rose-700">
                        {errors?._error?.[0] || 'Please try again.'}
                    </div>
                </Card>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => (
                    <Card key={p.id} className="p-6">
                        <div className="text-base font-semibold text-slate-900">{p.title}</div>
                        <CardImage title={p.title} src={p.thumbnail || ''} />
                        <div className="mt-3 text-sm text-slate-600">{p.description || ''}</div>

                        <div className="mt-4 flex items-center justify-between">
                            <div>
                                <div className="text-xs font-semibold text-slate-500">Category</div>
                                <div className="text-sm font-medium text-slate-900">{p.category || '—'}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-semibold text-slate-500">Price</div>
                                <div className="text-lg font-bold text-slate-900">{formatMoneyPHP(p.price)}</div>
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between">
                            <Badge tone={typeTone(p.deliveryType)}>{typeLabel(p.deliveryType)}</Badge>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                        setSelected(p);
                                        clearErrors();
                                        setForm({
                                            id: p.id,
                                            title: p.title,
                                            description: p.description || '',
                                            type: p.type || 'Digital',
                                            category_id: p.category_id || '',
                                            price: String(p.price ?? 0),
                                            thumbnail_path: p.thumbnail || '',
                                            thumbnail: null,
                                            thumbnail_preview: p.thumbnail || '',
                                            delivery_type: p.deliveryType || 'LINK',
                                            file_link: p.fileLink || '',
                                            upload_file_name: p.uploadFileName || '',
                                            product_file: null,
                                        });
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
                                            title: 'Delete Product',
                                            message: `Delete product ${p.title}? This action cannot be undone.`,
                                            onConfirm: async () => {
                                                const res = await deleteProduct(p.id);
                                                if (res.ok) {
                                                    toast('Deleted successfully');
                                                } else {
                                                    toast(res?.errors?._error?.[0] || 'Delete failed.', 'error');
                                                }
                                            }
                                        });
                                    }}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal open={createOpen} title="Add product" description="Create a product." onClose={() => setCreateOpen(false)}>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <ProductCardPreview
                        title={form.title}
                        src={form.thumbnail_preview}
                        description={form.description}
                        category={selectedCategoryName}
                        price={Number(form.price || 0)}
                    />

                    <div className="max-h-[70vh] overflow-y-auto pb-28">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <TextField
                                label="Title"
                                value={form.title}
                                onChange={(v) => setForm((s) => ({ ...s, title: v }))}
                                placeholder="e.g. JavaScript Essentials"
                            />
                            <TextField
                                label="Type"
                                value={form.type}
                                onChange={(v) => setForm((s) => ({ ...s, type: v }))}
                                placeholder="e.g. PDF Guide"
                            />
                            <SelectField
                                label="Category"
                                value={form.category_id}
                                onChange={(v) => setForm((s) => ({ ...s, category_id: v }))}
                                options={activeCategories.map((c) => ({ label: c.name, value: c.id }))}
                            />
                            <TextField
                                label="Price (PHP)"
                                value={form.price}
                                onChange={(v) => setForm((s) => ({ ...s, price: v }))}
                                placeholder="199"
                                type="number"
                            />

                            <div className="md:col-span-2">
                                <label className="block">
                                    <div className="text-xs font-semibold text-slate-600">Description</div>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                                        placeholder="Write a short product description"
                                        rows={4}
                                        className="mt-2 w-full rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900"
                                    />
                                </label>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block">
                                    <div className="text-xs font-semibold text-slate-600">Image (thumbnail)</div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            const preview = file ? URL.createObjectURL(file) : '';
                                            setForm((s) => ({ ...s, thumbnail: file || null, thumbnail_preview: preview }));
                                        }}
                                        className="mt-2 block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
                                    />
                                    {form.thumbnail_preview ? (
                                        <div className="mt-3 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                                            <img src={form.thumbnail_preview} alt="Preview" className="h-56 w-full object-cover" />
                                        </div>
                                    ) : null}
                                    <div className="mt-2 text-xs text-slate-500">Thumbnail only (mobile uses a generic icon if none).</div>
                                </label>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block">
                                    <div className="text-xs font-semibold text-slate-600">Product Type</div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setForm((s) => ({ ...s, delivery_type: 'LINK', upload_file_name: '', product_file: null }))}
                                            className={
                                                form.delivery_type === 'LINK'
                                                    ? 'rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white'
                                                    : 'rounded-xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200'
                                            }
                                        >
                                            Link Product
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setForm((s) => ({ ...s, delivery_type: 'FILE', file_link: '' }))}
                                            className={
                                                form.delivery_type === 'FILE'
                                                    ? 'rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white'
                                                    : 'rounded-xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200'
                                            }
                                        >
                                            File Upload Product
                                        </button>
                                    </div>
                                </label>
                            </div>

                            {form.delivery_type === 'LINK' ? (
                                <div className="md:col-span-2">
                                    <TextField
                                        label="File Link"
                                        value={form.file_link}
                                        onChange={(v) => setForm((s) => ({ ...s, file_link: v }))}
                                        placeholder="https://drive.google.com/..."
                                    />
                                    <div className="mt-2 text-xs text-slate-500">Paste Google Drive or external file link here</div>
                                </div>
                            ) : (
                                <div className="md:col-span-2">
                                    <label className="block">
                                        <div className="text-xs font-semibold text-slate-600">File Upload</div>
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                setForm((s) => ({ ...s, upload_file_name: file ? file.name : '', product_file: file || null }));
                                            }}
                                            className="mt-2 block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
                                        />
                                        <div className="mt-2 text-xs text-slate-500">Upload PDF, Word, Excel, or PowerPoint file</div>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 mt-6 flex flex-wrap justify-end gap-2 bg-white pt-4">
                    <Button variant="secondary" onClick={() => setCreateOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            (async () => {
                                const nextId = form.id?.trim() || `P-${String(Date.now()).slice(-6)}`;
                                const payload = {
                                    id: nextId,
                                    title: form.title,
                                    type: form.type,
                                    category_id: form.category_id,
                                    price: Number(form.price || 0),
                                    description: form.description || null,
                                    delivery_type: form.delivery_type,
                                    file_link: form.delivery_type === 'LINK' ? form.file_link : null,
                                    upload_file_name: form.delivery_type === 'FILE' ? form.upload_file_name : null,
                                };

                                if (form.thumbnail) payload.thumbnail = form.thumbnail;
                                if (form.delivery_type === 'FILE' && form.product_file) payload.product_file = form.product_file;

                                const res = await createProduct(payload);
                                if (!res.ok) return;
                                setCreateOpen(false);
                                toast(`Product added successfully`);
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
                title={`Edit product ${selected?.id || ''}`}
                description="Update product details."
                onClose={() => setEditOpen(false)}
            >
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <ProductCardPreview
                        title={form.title}
                        src={form.thumbnail_preview}
                        description={form.description}
                        category={selectedCategoryName}
                        price={Number(form.price || 0)}
                    />

                    <div className="max-h-[70vh] overflow-y-auto pb-28">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <TextField
                                label="Title"
                                value={form.title}
                                onChange={(v) => setForm((s) => ({ ...s, title: v }))}
                                placeholder="e.g. JavaScript Essentials"
                            />
                            <TextField
                                label="Type"
                                value={form.type}
                                onChange={(v) => setForm((s) => ({ ...s, type: v }))}
                                placeholder="e.g. PDF Guide"
                            />
                            <SelectField
                                label="Category"
                                value={form.category_id}
                                onChange={(v) => setForm((s) => ({ ...s, category_id: v }))}
                                options={activeCategories.map((c) => ({ label: c.name, value: c.id }))}
                            />
                            <TextField
                                label="Price (PHP)"
                                value={form.price}
                                onChange={(v) => setForm((s) => ({ ...s, price: v }))}
                                placeholder="199"
                                type="number"
                            />

                            <div className="md:col-span-2">
                                <label className="block">
                                    <div className="text-xs font-semibold text-slate-600">Description</div>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                                        placeholder="Write a short product description"
                                        rows={4}
                                        className="mt-2 w-full rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900"
                                    />
                                </label>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block">
                                    <div className="text-xs font-semibold text-slate-600">Image (thumbnail)</div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            const preview = file ? URL.createObjectURL(file) : '';
                                            setForm((s) => ({ ...s, thumbnail: file || null, thumbnail_preview: preview }));
                                        }}
                                        className="mt-2 block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
                                    />
                                    {form.thumbnail_preview ? (
                                        <div className="mt-3 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                                            <img src={form.thumbnail_preview} alt="Preview" className="h-56 w-full object-cover" />
                                        </div>
                                    ) : null}
                                    <div className="mt-2 text-xs text-slate-500">Thumbnail only (mobile uses a generic icon if none).</div>
                                </label>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block">
                                    <div className="text-xs font-semibold text-slate-600">Product Type</div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setForm((s) => ({ ...s, delivery_type: 'LINK', upload_file_name: '', product_file: null }))}
                                            className={
                                                form.delivery_type === 'LINK'
                                                    ? 'rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white'
                                                    : 'rounded-xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200'
                                            }
                                        >
                                            Link Product
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setForm((s) => ({ ...s, delivery_type: 'FILE', file_link: '' }))}
                                            className={
                                                form.delivery_type === 'FILE'
                                                    ? 'rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white'
                                                    : 'rounded-xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200'
                                            }
                                        >
                                            File Upload Product
                                        </button>
                                    </div>
                                </label>
                            </div>

                            {form.delivery_type === 'LINK' ? (
                                <div className="md:col-span-2">
                                    <TextField
                                        label="File Link"
                                        value={form.file_link}
                                        onChange={(v) => setForm((s) => ({ ...s, file_link: v }))}
                                        placeholder="https://drive.google.com/..."
                                    />
                                    <div className="mt-2 text-xs text-slate-500">Paste Google Drive or external file link here</div>
                                </div>
                            ) : (
                                <div className="md:col-span-2">
                                    <label className="block">
                                        <div className="text-xs font-semibold text-slate-600">File Upload</div>
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                setForm((s) => ({ ...s, upload_file_name: file ? file.name : '', product_file: file || null }));
                                            }}
                                            className="mt-2 block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
                                        />
                                        <div className="mt-2 text-xs text-slate-500">Upload PDF, Word, Excel, or PowerPoint file</div>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 mt-6 flex flex-wrap justify-between gap-2 bg-white pt-4">
                    <Button
                        variant="danger"
                        onClick={() => {
                            if (!selected) return;
                            confirmAction({
                                title: 'Delete product',
                                message: `Delete product ${selected.title}?`,
                                onConfirm: async () => {
                                    const res = await deleteProduct(selected.id);
                                    if (!res.ok) return;
                                    setEditOpen(false);
                                    toast(`Deleted successfully`);
                                }
                            });
                        }}
                        disabled={mutating}
                    >
                        Delete
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                (async () => {
                                    if (!selected) return;
                                    const payload = {
                                        id: form.id,
                                        title: form.title,
                                        type: form.type,
                                        category_id: form.category_id,
                                        price: Number(form.price || 0),
                                        description: form.description || null,
                                        delivery_type: form.delivery_type,
                                        file_link: form.delivery_type === 'LINK' ? form.file_link : null,
                                        upload_file_name: form.delivery_type === 'FILE' ? form.upload_file_name : null,
                                    };

                                    if (form.thumbnail) payload.thumbnail = form.thumbnail;
                                    if (form.delivery_type === 'FILE' && form.product_file) payload.product_file = form.product_file;

                                    const res = await updateProduct(selected.id, payload);
                                    if (!res.ok) return;
                                    setEditOpen(false);
                                    toast(`Updated successfully`);
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
