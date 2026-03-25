const STORAGE_KEY = 'bookify_admin_mock_auth';

export const MOCK_CREDENTIALS = [
    {
        role: 'SUPER_ADMIN',
        email: 'superadmin@gmail.com',
        password: '12345678',
        name: 'Super Admin',
    },
    {
        role: 'ADMIN',
        email: 'admin@gmail.com',
        password: '12345678',
        name: 'Admin',
    },
    {
        role: 'MODERATOR',
        email: 'moderator@gmail.com',
        password: '12345678',
        name: 'Moderator',
    },
];

export function getStoredUser() {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.email || !parsed?.role) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function storeUser(user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
    window.localStorage.removeItem(STORAGE_KEY);
}

export function authenticate(email, password) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPassword = String(password || '');

    const match = MOCK_CREDENTIALS.find(
        (u) => u.email.toLowerCase() === normalizedEmail && u.password === normalizedPassword,
    );

    if (!match) {
        return {
            ok: false,
            error: 'Invalid credentials. Use the provided mock accounts.',
        };
    }

    const user = {
        name: match.name,
        email: match.email,
        role: match.role,
    };

    return { ok: true, user };
}

export function roleLabel(role) {
    if (role === 'SUPER_ADMIN') return 'Super Admin';
    if (role === 'ADMIN') return 'Admin';
    if (role === 'MODERATOR') return 'Moderator';
    return 'Unknown';
}

export function roleHomeRoute(role) {
    if (role === 'MODERATOR') return route('admin.moderator.monitoring');
    return route('admin.dashboard');
}

export function canAccess(role, key) {
    const R = role;

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
        'admin.orders.index',
        'admin.orders.show',
    ]);

    if (R === 'SUPER_ADMIN') return SUPER.has(key);
    if (R === 'ADMIN') return ADMIN.has(key);
    if (R === 'MODERATOR') return MOD.has(key);
    return false;
}
