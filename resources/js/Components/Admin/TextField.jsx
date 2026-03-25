function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function TextField({ label, value, onChange, placeholder, className = '', type = 'text' }) {
    return (
        <label className={classNames('block', className)}>
            {label ? <div className="text-xs font-semibold text-slate-600">{label}</div> : null}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className="mt-2 w-full rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900"
            />
        </label>
    );
}
