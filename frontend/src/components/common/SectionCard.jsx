export default function SectionCard({ title, description, action, children, className = '' }) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.03)] ${className}`}>
      {(title || description || action) && <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-900">{title}</h2>{description && <p className="mt-1 text-xs text-slate-500">{description}</p>}</div>{action}</div>}
      {children}
    </section>
  )
}
