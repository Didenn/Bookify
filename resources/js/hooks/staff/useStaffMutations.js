import { useCallback, useMemo, useState } from 'react';
import ensureCsrf from '@/lib/ensureCsrf';

function normalizeErrors(e) {
    const resErrors = e?.response?.data?.errors;
    if (resErrors && typeof resErrors === 'object') return resErrors;
    const msg = e?.response?.data?.message || e?.message || 'Request failed.';
    return { _error: [msg] };
}

export function useStaffMutations({ onCreated, onUpdated, onDeleted } = {}) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);

    const createStaff = useCallback(
        async ({ name, email, password, role }) => {
            setLoading(true);
            setErrors(null);
            try {
                await ensureCsrf();
                const res = await window.axios.post(route('admin.staff.store'), {
                    name,
                    email,
                    password,
                    role,
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

    const updateStaff = useCallback(
        async (id, { name, email, password, role }) => {
            setLoading(true);
            setErrors(null);
            try {
                await ensureCsrf();
                const res = await window.axios.put(route('admin.staff.update', id), {
                    name,
                    email,
                    password: password || null,
                    role,
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

    const deleteStaff = useCallback(
        async (id) => {
            setLoading(true);
            setErrors(null);
            try {
                await ensureCsrf();
                await window.axios.delete(route('admin.staff.destroy', id));
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
            createStaff,
            updateStaff,
            deleteStaff,
            clearErrors: () => setErrors(null),
        }),
        [loading, errors, createStaff, updateStaff, deleteStaff],
    );
}
