import { router } from '@inertiajs/react';
import { useEffect } from 'react';

export default function ManageAdmins() {
    useEffect(() => {
        router.visit(route('admin.staff.index'));
    }, []);

    return null;
}
