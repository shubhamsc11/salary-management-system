import { Inbox } from 'lucide-react'

export default function EmptyState({ title = 'Nothing here yet', description = 'There are no records to display.' }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-2 px-6 text-center">
      <span className="mb-1 rounded-full bg-slate-100 p-3 text-slate-400"><Inbox size={22} /></span>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  )
}
