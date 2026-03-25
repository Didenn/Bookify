function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const VARIANT = {
    primary: 'bg-[#1a1a1a] text-white hover:bg-[#303030] shadow-[0_1px_2px_rgba(0,0,0,0.15)] ring-1 ring-black/10 focus:ring-[#1a1a1a]',
    secondary: 'bg-white text-[#303030] hover:bg-slate-50 ring-1 ring-inset ring-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:ring-[#1a1a1a]',
    subtle: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-900',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-[0_1px_2px_rgba(0,0,0,0.15)] focus:ring-rose-600',
};

const SIZE = {
    sm: 'h-8 px-3 text-[13px]',
    md: 'h-9 px-4 text-sm',
};

export default function Button({
    type = 'button',
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    children,
    ...props
}) {
    return (
        <button
            type={type}
            disabled={disabled}
            className={classNames(
                'inline-flex items-center justify-center rounded-[8px] font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
                VARIANT[variant] || VARIANT.primary,
                SIZE[size] || SIZE.md,
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}
