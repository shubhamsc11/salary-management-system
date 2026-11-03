import { LoaderCircle } from 'lucide-react'

export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-sm text-slate-500" role="status">
      <LoaderCircle size={24} className="animate-spin text-blue-600" />
      <span>{label}</span>
    </div>
  )
}
