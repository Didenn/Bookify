import { useEffect } from 'react';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function Modal({ open, title, description, children, onClose }) {
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100]">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="absolute inset-0 grid place-items-center p-4">
                <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-sm font-semibold text-slate-900">{title}</div>
                                {description ? (
                                    <div className="mt-1 text-sm text-slate-500">{description}</div>
                                ) : null}
                            </div>
                            <button
                                type="button"
                                className={classNames(
                                    'rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100',
                                )}
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    <div className="px-5 py-5">{children}</div>
                </div>
            </div>
        </div>
    );
}
