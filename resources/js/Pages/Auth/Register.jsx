import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Register() {
    useEffect(() => {
        router.visit(route('welcome'));
    }, []);

    return (
        <GuestLayout>
            <Head title="Register" />
            <div className="text-sm text-slate-600">
                Registration is disabled. Redirecting to Welcome…
            </div>
            <div className="mt-4">
                <Link href={route('welcome')} className="text-sm font-medium text-slate-900 underline">
                    Go to Welcome
                </Link>
            </div>
        </GuestLayout>
    );
}
