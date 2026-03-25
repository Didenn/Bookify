import { useCallback, useMemo, useState } from 'react';
import ensureCsrf from '@/lib/ensureCsrf';

function normalizeErrors(e) {
    const resErrors = e?.response?.data?.errors;
    if (resErrors && typeof resErrors === 'object') return resErrors;
    const msg = e?.response?.data?.message || e?.message || 'Request failed.';
    return { _error: [msg] };
}

export function useCategoryMutations({ onCreated, onUpdated, onDeleted } = {}) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);

    const createCategory = useCallback(
        async ({ id, name, status }) => {
            setLoading(true);
            setErrors(null);
            try {
                await ensureCsrf();
                const res = await window.axios.post(route('admin.categories.store'), {
                    id,
                    name,
                    status,
                });
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

    const updateCategory = useCallback(
        async (id, { name, status }) => {
            setLoading(true);
            setErrors(null);
            try {
                await ensureCsrf();
                const res = await window.axios.put(route('admin.categories.update', id), {
                    name,
                    status,
                });
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

    const deleteCategory = useCallback(
        async (id) => {
            setLoading(true);
            setErrors(null);
            try {
                await ensureCsrf();
                await window.axios.delete(route('admin.categories.destroy', id));
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
            createCategory,
            updateCategory,
            deleteCategory,
            clearErrors: () => setErrors(null),
        }),
        [loading, errors, createCategory, updateCategory, deleteCategory],
    );
}
