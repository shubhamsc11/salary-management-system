export default function DataTable({ columns, rows, empty }) {
  if (!rows.length) return empty

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
            {columns.map((column) => <th key={column.key} className="px-5 py-3 font-semibold">{column.label}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rowIndex) => (
            <tr key={row.id ?? rowIndex} className="transition hover:bg-blue-50/30">
              {columns.map((column) => <td key={column.key} className="px-5 py-4 text-slate-700">{column.render ? column.render(row) : row[column.key] ?? '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
