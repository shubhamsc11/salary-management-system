import { Bell, Menu, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/salary-records': 'Salary Records',
  '/countries': 'Countries',
  '/departments': 'Departments',
}

export default function Header({ onMenuClick }) {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Workspace'

  return (
    <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onMenuClick} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Open navigation"><Menu size={21} /></button>
        <div><p className="text-xs font-medium text-slate-400">HR Management System</p><h2 className="text-lg font-bold text-slate-900">{title}</h2></div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button type="button" className="hidden rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 sm:block" aria-label="Search"><Search size={19} /></button>
        <button type="button" className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Notifications"><Bell size={19} /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-blue-600" /></button>
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">HR</div>
          <div className="hidden text-left sm:block"><p className="text-sm font-semibold text-slate-800">HR Manager</p><p className="text-[11px] text-slate-400">Administrator</p></div>
        </div>
      </div>
    </header>
  )
}
