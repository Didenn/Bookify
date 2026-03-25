import { useEffect, useState } from 'react';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function Toast() {
    const [queue, setQueue] = useState([]);

    useEffect(() => {
        const handler = (e) => {
            const id = Date.now() + Math.random();
            const { message, type } = e.detail;

            setQueue((q) => [...q, { id, message, type }]);

            setTimeout(() => {
                setQueue((q) => q.filter((t) => t.id !== id));
            }, 3000);
        };

        window.addEventListener('ux-toast', handler);
        return () => window.removeEventListener('ux-toast', handler);
    }, []);

    if (queue.length === 0) return null;

    return (
        <div className="fixed end-4 top-4 z-[999] flex flex-col items-end gap-2 pointer-events-none">
            {queue.map((t) => (
                <div
                    key={t.id}
                    className={classNames(
                        'flex items-center gap-3 overflow-hidden rounded-lg px-4 py-3 shadow-md ring-1 slide-in-top pointer-events-auto transition-all',
                        t.type === 'error'
                            ? 'bg-rose-50 text-rose-700 ring-rose-200'
                            : 'bg-slate-900 text-white ring-slate-800' // Shopify dark toast
                    )}
                >
                    {t.type === 'error' ? (
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4" />
                            <path d="M12 16h.01" />
                        </svg>
                    ) : (
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    )}
                    <span className="text-sm font-medium">{t.message}</span>
                </div>
            ))}
            
            <style jsx="true">{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .slide-in-top {
                    animation: slideIn 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
