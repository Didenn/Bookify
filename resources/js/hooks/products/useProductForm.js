import { useMemo, useState } from 'react';

export function useProductForm(initial) {
    const [form, setForm] = useState(initial);

    return useMemo(
        () => ({
            form,
            setForm,
            reset: (next) => setForm(next || initial),
        }),
        [form, initial],
    );
}
