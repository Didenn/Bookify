import { useCallback, useMemo, useState } from 'react';
import ensureCsrf from '@/lib/ensureCsrf';

function normalizeErrors(e) {
    const resErrors = e?.response?.data?.errors;
    if (resErrors && typeof resErrors === 'object') return resErrors;
    const msg = e?.response?.data?.message || e?.message || 'Request failed.';
    return { _error: [msg] };
}

function toFormData(payload) {
    const fd = new FormData();
    Object.entries(payload || {}).forEach(([k, v]) => {
        if (v === undefined) return;
        if (v === null) {
            fd.append(k, '');
            return;
        }
        fd.append(k, v);
    });
    return fd;
}

export function useProductMutations({ onCreated, onUpdated, onDeleted } = {}) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);

    const createProduct = useCallback(
        async (payload) => {
            setLoading(true);
            setErrors(null);
            try {
                await ensureCsrf();
                const hasFile = payload?.thumbnail instanceof File || payload?.product_file instanceof File;
                const body = hasFile ? toFormData(payload) : payload;
                const res = await window.axios.post(route('admin.products.store'), body);
                onCreated?.(res?.data?.data);
                return { ok: true, data: res?.data?.data };
            } catch (e) {
                const next = normalizeErrors(e);
                setErrors(next);
                return { ok: false, errors: next };
            } finally {
                setLoading(false);
            }
        },
        [onCreated],
    );

    const updateProduct = useCallback(
        async (id, payload) => {
            setLoading(true);
            setErrors(null);
            try {
                await ensureCsrf();
                const hasFile = payload?.thumbnail instanceof File || payload?.product_file instanceof File;
                if (hasFile) {
                    const body = toFormData({ ...payload, _method: 'PUT' });
                    const res = await window.axios.post(route('admin.products.update', id), body);
                    onUpdated?.(res?.data?.data);
                    return { ok: true, data: res?.data?.data };
                }

                const res = await window.axios.put(route('admin.products.update', id), payload);
                onUpdated?.(res?.data?.data);
                return { ok: true, data: res?.data?.data };
            } catch (e) {
                const next = normalizeErrors(e);
                setErrors(next);
                return { ok: false, errors: next };
            } finally {
                setLoading(false);
            }
        },
        [onUpdated],
    );

    const deleteProduct = useCallback(
        async (id) => {
            setLoading(true);
            setErrors(null);
            try {
                await ensureCsrf();
                await window.axios.delete(route('admin.products.destroy', id));
                onDeleted?.(id);
                return { ok: true };
            } catch (e) {
                const next = normalizeErrors(e);
                setErrors(next);
                return { ok: false, errors: next };
            } finally {
                setLoading(false);
            }
        },
        [onDeleted],
    );

    return useMemo(
        () => ({
            loading,
            errors,
            createProduct,
            updateProduct,
            deleteProduct,
            clearErrors: () => setErrors(null),
        }),
        [loading, errors, createProduct, updateProduct, deleteProduct],
    );
}
