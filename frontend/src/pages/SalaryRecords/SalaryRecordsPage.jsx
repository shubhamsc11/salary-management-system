import { CheckCircle2, Eye, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SalaryRecordForm from '../../components/forms/SalaryRecordForm'
import Button from '../../components/common/Button'
import ConfirmationDialog from '../../components/common/ConfirmationDialog'
import DataTable from '../../components/common/DataTable'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import Input from '../../components/common/Input'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import SectionCard from '../../components/common/SectionCard'
import Select from '../../components/common/Select'
import { getApiErrorMessage } from '../../api'
import useAsync from '../../hooks/useAsync'
import useDebouncedValue from '../../hooks/useDebouncedValue'
import { getEmployees } from '../../services/employeeService'
import { deleteSalaryRecord, getEmployeeSalaryRecords } from '../../services/salaryRecordService'

function formatAmount(value, currency) {
  if (value === null || value === undefined || value === '') return '—'
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 2 }).format(Number(value))
}

function isCurrent(record) {
  const today = new Date().toISOString().slice(0, 10)
  return record.effective_from <= today && (!record.effective_to || record.effective_to >= today)
}

export default function SalaryRecordsPage() {
  const [searchParams] = useSearchParams()
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('')
  const [employeeId, setEmployeeId] = useState(() => searchParams.get('employee') || '')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [page, setPage] = useState(1)
  const [formRecord, setFormRecord] = useState(null)
  const [viewRecord, setViewRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [notice, setNotice] = useState(null)
  const employeeSearch = useDebouncedValue(employeeSearchTerm)

  const employeesState = useAsync(() => getEmployees({ search: employeeSearch, per_page: 10 }), employeeSearch)
  const recordsState = useAsync(() => employeeId ? getEmployeeSalaryRecords(employeeId, { page, per_page: 10 }) : Promise.resolve(null), `${employeeId}:${page}`)
  const employees = employeesState.data?.data || []
  const employeeOptions = selectedEmployee && !employees.some((employee) => employee.id === selectedEmployee.id) ? [selectedEmployee, ...employees] : employees
  const records = recordsState.data?.data || []

  function chooseEmployee(event) {
    const nextId = event.target.value
    const employee = employeeOptions.find((item) => String(item.id) === nextId) || null
    setEmployeeId(nextId)
    setSelectedEmployee(employee)
    setPage(1)
  }

  function handleSaved() {
    const action = formRecord?.id ? 'updated' : 'added'
    setFormRecord(null)
    setNotice({ type: 'success', message: `Salary record ${action} successfully.` })
    recordsState.retry()
  }

  async function handleDelete() {
    if (!deleteRecord) return
    setActionLoading(true)
    try {
      await deleteSalaryRecord(deleteRecord.id)
      setDeleteRecord(null)
      setNotice({ type: 'success', message: 'Salary record deleted successfully.' })
      recordsState.retry()
    } catch (error) {
      setNotice({ type: 'error', message: getApiErrorMessage(error) })
    } finally {
      setActionLoading(false)
    }
  }

  const columns = [
    { key: 'period', label: 'Period', render: (row) => <div><p className="font-semibold text-slate-800">{row.effective_from}</p><p className="text-xs text-slate-400">to {row.effective_to || 'Current'}</p></div> },
    { key: 'status', label: 'Status', render: (row) => <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isCurrent(row) ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{isCurrent(row) ? 'Current' : 'Historical'}</span> },
    { key: 'basic_salary', label: 'Basic', render: (row) => formatAmount(row.basic_salary, row.currency) },
    { key: 'bonus', label: 'Bonus', render: (row) => formatAmount(row.bonus, row.currency) },
    { key: 'allowances', label: 'Allowances', render: (row) => formatAmount(row.allowances, row.currency) },
    { key: 'deductions', label: 'Deductions', render: (row) => formatAmount(row.deductions, row.currency) },
    { key: 'net_salary', label: 'Net salary', render: (row) => <span className="font-bold text-slate-900">{formatAmount(row.net_salary, row.currency)}</span> },
    { key: 'actions', label: 'Actions', render: (row) => <div className="flex items-center gap-1"><button type="button" onClick={() => setViewRecord(row)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="View salary record" aria-label="View salary record"><Eye size={16} /></button><button type="button" onClick={() => setFormRecord(row)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Edit salary record" aria-label="Edit salary record"><Pencil size={16} /></button><button type="button" onClick={() => setDeleteRecord(row)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Delete salary record" aria-label="Delete salary record"><Trash2 size={16} /></button></div> },
  ]

  return <div>
    <PageHeader title="Salary Records" description="Manage current and historical compensation records." action={<Button onClick={() => setFormRecord({})} disabled={!employeeId}><Plus size={17} /> Add salary record</Button>} />
    {notice && <div className={`mb-5 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`} role="status"><span className="flex items-center gap-2">{notice.type === 'success' && <CheckCircle2 size={17} />}{notice.message}</span><button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification"><X size={16} /></button></div>}
    <SectionCard title="Salary history" description="Select an employee to review their salary periods.">
      <div className="grid gap-4 border-b border-slate-100 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]"><Input id="salary-employee-search" label="Find employee" placeholder="Search name, email or code..." value={employeeSearchTerm} onChange={(event) => setEmployeeSearchTerm(event.target.value)} /><Select id="salary-employee" label="Employee" value={employeeId} onChange={chooseEmployee} options={[{ value: '', label: employeesState.loading ? 'Loading employees...' : 'Select employee' }, ...employeeOptions.map((employee) => ({ value: employee.id, label: `${employee.first_name} ${employee.last_name} · ${employee.employee_code}` }))]} /></div>
      {!employeeId ? <EmptyState title="Choose an employee" description="Search for an employee above to load their salary history." /> : recordsState.loading ? <LoadingSpinner label="Loading salary history..." /> : recordsState.error ? <ErrorState message={recordsState.error} onRetry={recordsState.retry} /> : <DataTable rows={records} empty={<EmptyState title="No salary records" description="This employee has no salary history available." />} columns={columns} />}
      {employeeId && !recordsState.loading && !recordsState.error && <Pagination meta={recordsState.data?.meta} onPageChange={setPage} />}
    </SectionCard>
    <Modal open={Boolean(formRecord)} title={formRecord?.id ? 'Edit salary record' : 'Add salary record'} onClose={() => setFormRecord(null)} size="lg"><SalaryRecordForm record={formRecord?.id ? formRecord : null} employeeId={employeeId} employeeOptions={employeeOptions} onCancel={() => setFormRecord(null)} onSaved={handleSaved} /></Modal>
    <Modal open={Boolean(viewRecord)} title="Salary record details" onClose={() => setViewRecord(null)}><div className="space-y-4 text-sm"><div className="rounded-xl bg-slate-50 p-4"><p className="font-semibold text-slate-900">{viewRecord?.employee?.first_name} {viewRecord?.employee?.last_name}</p><p className="mt-1 text-xs text-slate-500">{viewRecord?.employee?.employee_code} · {viewRecord?.employee?.email}</p></div><div className="grid grid-cols-2 gap-4">{[['Basic salary', viewRecord?.basic_salary], ['Bonus', viewRecord?.bonus], ['Allowances', viewRecord?.allowances], ['Deductions', viewRecord?.deductions], ['Net salary', viewRecord?.net_salary], ['Currency', viewRecord?.currency], ['Effective from', viewRecord?.effective_from], ['Effective to', viewRecord?.effective_to || 'Current']].map(([label, value]) => <div key={label}><p className="text-xs text-slate-400">{label}</p><p className="mt-1 font-semibold text-slate-800">{['Basic salary', 'Bonus', 'Allowances', 'Deductions', 'Net salary'].includes(label) ? formatAmount(value, viewRecord?.currency) : value}</p></div>)}</div></div></Modal>
    <ConfirmationDialog open={Boolean(deleteRecord)} title="Delete salary record?" description="This removes the selected salary record from the employee history. Continue only if this record can be removed under your business rules." onCancel={() => setDeleteRecord(null)} onConfirm={handleDelete} loading={actionLoading} />
  </div>
}
