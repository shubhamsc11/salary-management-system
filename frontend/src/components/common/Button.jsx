import { LoaderCircle } from 'lucide-react'

const variants = {
  primary: 'bg-[#1d4ed8] text-white hover:bg-[#1e40af] focus-visible:ring-blue-300',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-300',
  ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-300',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-300',
}

export default function Button({ children, variant = 'primary', loading = false, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <LoaderCircle size={16} className="animate-spin" />}
      {children}
    </button>
  )
}
