import { AlertTriangle } from 'lucide-react'
import Button from './Button'
import Modal from './Modal'

export default function ConfirmationDialog({ open, title = 'Are you sure?', description, onCancel, onConfirm, loading = false }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="flex gap-3">
        <span className="rounded-full bg-amber-50 p-2 text-amber-600"><AlertTriangle size={18} /></span>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>Confirm</Button>
      </div>
    </Modal>
  )
}
