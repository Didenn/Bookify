function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function Card({ children, className = '' }) {
    return (
        <div
            className={classNames(
                'rounded-xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] ring-1 ring-slate-200/50',
                className,
            )}
        >
            {children}
        </div>
    );
}
