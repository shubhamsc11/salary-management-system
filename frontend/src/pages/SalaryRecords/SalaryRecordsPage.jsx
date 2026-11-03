import { CircleDollarSign } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DataTable from '../../components/common/DataTable'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import SectionCard from '../../components/common/SectionCard'
import Select from '../../components/common/Select'
import useAsync from '../../hooks/useAsync'
import { getEmployees } from '../../services/employeeService'
import { getEmployeeSalaryRecords } from '../../services/salaryRecordService'

export default function SalaryRecordsPage() {
  const [searchParams] = useSearchParams()
  const [employeeId, setEmployeeId] = useState(() => searchParams.get('employee') || '')
  const [page, setPage] = useState(1)
  const employeesState = useAsync(() => getEmployees({ per_page: 100 }))
  const recordsState = useAsync(() => employeeId ? getEmployeeSalaryRecords(employeeId, { page, per_page: 10 }) : Promise.resolve(null), `${employeeId}:${page}`)
  const employees = employeesState.data?.data || []
  const records = recordsState.data?.data || []
  const currency = (value) => value ? `${Number(value).toLocaleString()} ` : '—'

  return <div><PageHeader title="Salary Records" description="Review historical compensation records for an employee." action={<div className="hidden items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500 sm:flex"><CircleDollarSign size={15} /> Record actions coming soon</div>} /><SectionCard title="Salary history" description="Select an employee to view their effective salary records."><div className="border-b border-slate-100 p-4 sm:max-w-sm"><Select id="salary-employee" label="Employee" value={employeeId} onChange={(event) => { setEmployeeId(event.target.value); setPage(1) }} options={[{ value: '', label: employeesState.loading ? 'Loading employees...' : 'Select an employee' }, ...employees.map((employee) => ({ value: employee.id, label: `${employee.first_name} ${employee.last_name} · ${employee.employee_code}` }))]} /></div>{!employeeId ? <EmptyState title="Choose an employee" description="Salary history will appear after selecting an employee." /> : recordsState.loading ? <LoadingSpinner label="Loading salary history..." /> : recordsState.error ? <ErrorState message={recordsState.error} onRetry={recordsState.retry} /> : <DataTable rows={records} empty={<EmptyState title="No salary records" description="This employee has no salary history available." />} columns={[{ key: 'effective_from', label: 'Effective from' }, { key: 'effective_to', label: 'Effective to', render: (row) => row.effective_to || 'Current' }, { key: 'currency', label: 'Currency' }, { key: 'basic_salary', label: 'Basic salary', render: (row) => `${currency(row.basic_salary)}${row.currency}` }, { key: 'net_salary', label: 'Net salary', render: (row) => `${currency(row.net_salary)}${row.currency}` }]} />}{employeeId && !recordsState.loading && !recordsState.error && <Pagination meta={recordsState.data?.meta} onPageChange={setPage} />}</SectionCard></div>
}
