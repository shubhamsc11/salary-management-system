import { Building2, ChevronRight, CircleDollarSign, Globe2, LayoutDashboard, Users, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigation = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Employees', to: '/employees', icon: Users },
  { label: 'Salary Records', to: '/salary-records', icon: CircleDollarSign },
  { label: 'Countries', to: '/countries', icon: Globe2 },
  { label: 'Departments', to: '/departments', icon: Building2 },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <button type="button" className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#11264d] text-white transition-transform duration-200 lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-blue-500 font-black shadow-lg shadow-blue-950/30">P</div>
            <div><p className="font-bold tracking-tight">PeopleOps</p><p className="text-[11px] text-blue-200">Salary management</p></div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-blue-200 hover:bg-white/10 lg:hidden" aria-label="Close navigation"><X size={18} /></button>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6" aria-label="Primary navigation">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300/70">Workspace</p>
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-white text-[#11264d] shadow-lg shadow-blue-950/20' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}>
              {({ isActive }) => <><Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} /><span className="flex-1">{label}</span><ChevronRight size={15} className={`transition ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`} /></>}
            </NavLink>
          ))}
        </nav>
        <div className="m-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white">Need a hand?</p>
          <p className="mt-1 text-xs leading-5 text-blue-200">Use the navigation to manage your workforce workspace.</p>
        </div>
      </aside>
    </>
  )
}
