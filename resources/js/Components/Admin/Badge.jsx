function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const COLOR = {
    gray: 'bg-slate-100 text-slate-700 ring-slate-200',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    yellow: 'bg-amber-50 text-amber-800 ring-amber-200',
    red: 'bg-rose-50 text-rose-700 ring-rose-200',
    blue: 'bg-sky-50 text-sky-700 ring-sky-200',
    purple: 'bg-violet-50 text-violet-700 ring-violet-200',
};

export default function Badge({ children, tone = 'gray', className = '' }) {
    const toneClass = COLOR[tone] || COLOR.gray;

    return (
        <span
            className={classNames(
                'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
                toneClass,
                className,
            )}
        >
            {children}
        </span>
    );
}
