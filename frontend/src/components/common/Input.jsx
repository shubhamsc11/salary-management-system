export default function Input({ label, hint, error, id, className = '', ...props }) {
  return (
    <label htmlFor={id} className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label && <span>{label}</span>}
      <input
        id={id}
        className={`min-h-10 rounded-lg border bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${error ? 'border-rose-400' : 'border-slate-200'} ${className}`}
        {...props}
      />
      {error ? <span className="text-xs font-normal text-rose-600">{error}</span> : hint && <span className="text-xs font-normal text-slate-500">{hint}</span>}
    </label>
  )
}
