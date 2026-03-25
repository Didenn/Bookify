function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function SelectField({ label, value, onChange, options, className = '' }) {
    return (
        <label className={classNames('block', className)}>
            {label ? <div className="text-xs font-semibold text-slate-600">{label}</div> : null}
            <select
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                className="mt-2 w-full rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-900"
            >
                {options?.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </label>
    );
}
