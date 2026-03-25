import { useCallback, useEffect, useMemo, useState } from 'react';

export function useProductsList() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await window.axios.get(route('admin.products.data'));
            setRows(res?.data?.data || []);
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return useMemo(
        () => ({
            rows,
            setRows,
            loading,
            error,
            refetch: fetchProducts,
        }),
        [rows, loading, error, fetchProducts],
    );
}
