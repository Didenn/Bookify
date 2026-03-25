import { useCallback, useEffect, useMemo, useState } from 'react';

export function useCategoriesList() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await window.axios.get(route('admin.categories.data'));
            setRows(res?.data?.data || []);
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return useMemo(
        () => ({
            rows,
            setRows,
            loading,
            error,
            refetch: fetchCategories,
        }),
        [rows, loading, error, fetchCategories],
    );
}
