import { useCallback, useMemo, useState } from 'react';

export function useStaffForm(initial) {
    const [values, setValues] = useState(() => ({
        name: initial?.name || '',
        email: initial?.email || '',
        password: '',
        role: initial?.role || 'admin',
    }));

    const setField = useCallback((key, value) => {
        setValues((prev) => ({ ...prev, [key]: value }));
    }, []);

    const reset = useCallback((next) => {
        setValues({
            name: next?.name || '',
            email: next?.email || '',
            password: '',
            role: next?.role || 'admin',
        });
    }, []);

    return useMemo(
        () => ({
            values,
            setField,
            reset,
        }),
        [values, setField, reset],
    );
}
