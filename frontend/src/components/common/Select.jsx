export default function Select({ label, id, options = [], className = '', ...props }) {
  return (
    <label htmlFor={id} className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label && <span>{label}</span>}
      <select
        id={id}
        className={`min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${className}`}
        {...props}
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  )
}
