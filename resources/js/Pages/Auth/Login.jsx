import GuestLayout from '@/Layouts/GuestLayout';
import Button from '@/Components/Admin/Button';
import TextField from '@/Components/Admin/TextField';
import { roleHomeRoute } from '@/lib/rbac';
import ensureCsrf from '@/lib/ensureCsrf';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Login() {
    const [error, setError] = useState(null);

    const page = usePage();
    const user = page?.props?.auth?.user || null;

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });

    useEffect(() => {
        if (user) {
            router.visit(roleHomeRoute(user.role));
        }
    }, [user]);

    if (user) return null;

    const submit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await ensureCsrf();
        } catch {
            setError('Unable to start session. Please try again.');
            return;
        }

        post(route('login'), {
            onError: (errs) => {
                setError(errs?.email || errs?.password || 'Invalid credentials.');
            },
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-[#1a1a1a]">Log in to Bookify</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Enter your credentials to access the admin portal.
                    </p>
                </div>

                {error ? (
                    <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
                        {error}
                    </div>
                ) : null}

                <form onSubmit={submit} className="space-y-4">
                    <TextField
                        label="Email"
                        value={data.email}
                        onChange={(v) => setData('email', v)}
                        placeholder="admin@gmail.com"
                    />
                    <TextField
                        label="Password"
                        value={data.password}
                        onChange={(v) => setData('password', v)}
                        placeholder="12345678"
                        type="password"
                    />

                    <Button type="submit" className="w-full" disabled={processing}>
                        {processing ? 'Logging in…' : 'Log in'}
                    </Button>
                </form>

                <div className="text-center text-sm text-slate-600">
                    <Link href={route('welcome')} className="font-medium text-slate-900 underline">
                        Learn more
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
