import { AlertCircle, RefreshCw } from 'lucide-react'
import Button from './Button'

export default function ErrorState({ message = 'Unable to load this data.', onRetry }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="rounded-full bg-rose-50 p-3 text-rose-500"><AlertCircle size={22} /></span>
      <p className="max-w-md text-sm text-slate-600">{message}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}><RefreshCw size={15} /> Try again</Button>}
    </div>
  )
}
