function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function Table({ columns, rows, keyField = 'id', onRowClick }) {
    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            {columns.map((c) => (
                                <th
                                    key={c.key}
                                    scope="col"
                                    className={classNames(
                                        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
                                        c.className,
                                    )}
                                >
                                    {c.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {rows.map((row) => (
                            <tr
                                key={row[keyField]}
                                className={classNames(
                                    onRowClick ? 'cursor-pointer hover:bg-slate-50' : '',
                                )}
                                onClick={() => onRowClick?.(row)}
                            >
                                {columns.map((c) => (
                                    <td key={c.key} className={classNames('px-4 py-3 text-sm text-slate-700', c.cellClassName)}>
                                        {typeof c.render === 'function' ? c.render(row) : row[c.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
