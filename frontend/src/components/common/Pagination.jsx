import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.total_pages <= 1) return null
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
      <p className="text-xs text-slate-500">Page {meta.page} of {meta.total_pages} · {meta.total_count} records</p>
      <div className="flex gap-2">
        <Button variant="secondary" className="px-3 py-2" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></Button>
        <Button variant="secondary" className="px-3 py-2" disabled={meta.page >= meta.total_pages} onClick={() => onPageChange(meta.page + 1)} aria-label="Next page"><ChevronRight size={16} /></Button>
      </div>
    </div>
  )
}
