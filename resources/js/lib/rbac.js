export function roleLabel(role) {
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'admin') return 'Admin';
    if (role === 'moderator') return 'Moderator';
    return 'Unknown';
}

export function roleHomeRoute(role) {
    if (role === 'moderator') return route('admin.moderator.monitoring');
    return route('admin.dashboard');
}

export function canAccess(role, key) {
    const SUPER = new Set([
        'admin.dashboard',
        'admin.staff.index',
        'admin.customers.index',
        'admin.customers.show',
        'admin.products.index',
        'admin.categories.index',
        'admin.orders.index',
        'admin.orders.show',
        'admin.notifications.index',
        'admin.moderator.monitoring',
    ]);

    const ADMIN = new Set([
        'admin.dashboard',
        'admin.products.index',
        'admin.categories.index',
        'admin.orders.index',
        'admin.orders.show',
        'admin.notifications.index',
    ]);

    const MOD = new Set([
        'admin.moderator.monitoring',
        'admin.moderator.products.index',
        'admin.moderator.product_performance',
        'admin.moderator.purchase_trends',
        'admin.moderator.user_analytics',
        'admin.orders.index',
        'admin.orders.show',
    ]);

    if (role === 'super_admin') return SUPER.has(key);
    if (role === 'admin') return ADMIN.has(key);
    if (role === 'moderator') return MOD.has(key);
    return false;
}
