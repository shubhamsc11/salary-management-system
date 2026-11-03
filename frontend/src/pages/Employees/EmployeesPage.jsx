import { Users } from 'lucide-react'
import { useState } from 'react'
import DataTable from '../../components/common/DataTable'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import Input from '../../components/common/Input'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import SectionCard from '../../components/common/SectionCard'
import StatusBadge from '../../components/common/StatusBadge'
import useAsync from '../../hooks/useAsync'
import { getEmployees } from '../../services/employeeService'

export default function EmployeesPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data: response, loading, error, retry } = useAsync(() => getEmployees({ search, page, per_page: 10 }), `${search}:${page}`)
  const rows = response?.data || []

  return <div>
    <PageHeader title="Employees" description="Browse your workforce directory and employee details." action={<div className="hidden items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500 sm:flex"><Users size={15} /> Management actions coming soon</div>} />
    <SectionCard title="Employee directory" description="Search and review employee records.">
      <div className="border-b border-slate-100 p-4"><Input id="employee-search" aria-label="Search employees" placeholder="Search by name, email or employee code..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} className="max-w-md pl-10" /></div>
      {loading ? <LoadingSpinner label="Loading employees..." /> : error ? <ErrorState message={error} onRetry={retry} /> : <DataTable rows={rows} empty={<EmptyState title="No employees found" description={search ? 'Try a different search term.' : 'Employee records from the API will appear here.'} />} columns={[{ key: 'employee_code', label: 'Employee', render: (row) => <div><p className="font-semibold text-slate-800">{row.first_name} {row.last_name}</p><p className="text-xs text-slate-400">{row.employee_code}</p></div> }, { key: 'email', label: 'Email' }, { key: 'designation', label: 'Designation' }, { key: 'country', label: 'Country', render: (row) => row.country?.name || '—' }, { key: 'department', label: 'Department', render: (row) => row.department?.name || '—' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }]} />}
      {!loading && !error && <Pagination meta={response?.meta} onPageChange={setPage} />}
    </SectionCard>
  </div>
}
