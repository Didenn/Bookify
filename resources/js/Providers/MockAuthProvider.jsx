import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    authenticate,
    clearStoredUser,
    getStoredUser,
    storeUser,
} from '@/mock/mockAuth';

const MockAuthContext = createContext(null);

export function MockAuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        if (typeof window === 'undefined') return null;
        return getStoredUser();
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const onStorage = (e) => {
            if (e.key === 'bookify_admin_mock_auth') {
                setUser(getStoredUser());
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const login = useCallback((email, password) => {
        const result = authenticate(email, password);
        if (!result.ok) return result;

        storeUser(result.user);
        setUser(result.user);
        return result;
    }, []);

    const logout = useCallback(() => {
        clearStoredUser();
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({
            user,
            isAuthenticated: Boolean(user),
            login,
            logout,
        }),
        [user, login, logout],
    );

    return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
}

export function useMockAuth() {
    const ctx = useContext(MockAuthContext);
    if (!ctx) {
        throw new Error('useMockAuth must be used within MockAuthProvider');
    }
    return ctx;
}
