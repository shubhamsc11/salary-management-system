import { ArrowLeft, CalendarDays, CircleDollarSign, Mail, MapPin, Pencil, UserRound } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import ErrorState from '../../components/common/ErrorState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PageHeader from '../../components/common/PageHeader'
import SectionCard from '../../components/common/SectionCard'
import StatusBadge from '../../components/common/StatusBadge'
import useAsync from '../../hooks/useAsync'
import { getEmployee } from '../../services/employeeService'

function DetailItem({ label, value, icon: Icon }) {
  return <div className="flex gap-3"><span className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-500"><Icon size={16} /></span><div><p className="text-xs font-medium text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value || '—'}</p></div></div>
}

export default function EmployeeDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: response, loading, error, retry } = useAsync(() => getEmployee(id), id)
  const employee = response?.data

  if (loading) return <><PageHeader title="Employee details" /><SectionCard><LoadingSpinner label="Loading employee..." /></SectionCard></>
  if (error) return <><PageHeader title="Employee details" /><SectionCard><ErrorState message={error} onRetry={retry} /></SectionCard></>

  return <div>
    <PageHeader title={employee ? `${employee.first_name} ${employee.last_name}` : 'Employee details'} description="Review personal and employment information." action={<div className="flex gap-2"><Button variant="secondary" onClick={() => navigate('/employees')}><ArrowLeft size={16} /> Back</Button><Link to={`/employees/${employee.id}/edit`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1d4ed8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1e40af]"><Pencil size={16} /> Edit employee</Link></div>} />
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
      <SectionCard title="Personal information" description="Contact details and organizational assignment."><div className="grid gap-6 p-5 sm:grid-cols-2"><DetailItem label="Full name" value={`${employee.first_name} ${employee.last_name}`} icon={UserRound} /><DetailItem label="Email address" value={employee.email} icon={Mail} /><DetailItem label="Country" value={`${employee.country?.name || '—'}${employee.country?.code ? ` (${employee.country.code})` : ''}`} icon={MapPin} /><DetailItem label="Department" value={employee.department?.name} icon={UserRound} /></div></SectionCard>
      <SectionCard title="Employment status"><div className="space-y-5 p-5"><div><p className="mb-2 text-xs font-medium text-slate-400">Current status</p><StatusBadge status={employee.status} /></div><DetailItem label="Employee code" value={employee.employee_code} icon={UserRound} /><DetailItem label="Joining date" value={employee.joining_date} icon={CalendarDays} /></div></SectionCard>
    </div>
    <SectionCard title="Role information" className="mt-6"><div className="grid gap-6 p-5 sm:grid-cols-2"><DetailItem label="Designation" value={employee.designation} icon={UserRound} /><DetailItem label="Salary history" value="View effective and historical records" icon={CircleDollarSign} /></div><div className="border-t border-slate-100 px-5 py-4"><Link to={`/salary-records?employee=${employee.id}`} className="text-sm font-semibold text-blue-700 hover:text-blue-800">Open salary history →</Link></div></SectionCard>
  </div>
}
