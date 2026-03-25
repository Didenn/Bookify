import { useEffect, useMemo } from 'react';
import { canAccess, roleHomeRoute } from '@/lib/rbac';
import { router, usePage } from '@inertiajs/react';

export default function RequireRole({ permissionKey, children }) {
    const page = usePage();
    const user = page?.props?.auth?.user || null;

    const key = useMemo(() => {
        if (permissionKey) return permissionKey;
        return page?.component ? page.component.replace('/', '.').toLowerCase() : null;
    }, [permissionKey, page]);

    useEffect(() => {
        if (!user) {
            router.visit(route('welcome'));
            return;
        }

        if (!permissionKey) return;

        if (!canAccess(user.role, permissionKey)) {
            router.visit(roleHomeRoute(user.role));
        }
    }, [user, permissionKey]);

    if (!user) return null;

    if (permissionKey && !canAccess(user.role, permissionKey)) return null;

    return children;
}
