import { useCallback, useEffect, useMemo, useState } from 'react';

export function useStaffList() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStaff = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await window.axios.get(route('admin.staff.data'));
            setRows(res?.data?.data || []);
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    return useMemo(
        () => ({
            rows,
            setRows,
            loading,
            error,
            refetch: fetchStaff,
        }),
        [rows, loading, error, fetchStaff],
    );
}
