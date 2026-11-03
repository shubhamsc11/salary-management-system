import { CheckCircle2, Eye, Filter, Pencil, Plus, UserRoundX, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import EmployeeForm from '../../components/forms/EmployeeForm'
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
import StatusBadge from '../../components/common/StatusBadge'
import { getApiErrorMessage } from '../../api'
import useAsync from '../../hooks/useAsync'
import useDebouncedValue from '../../hooks/useDebouncedValue'
import { getCountries } from '../../services/countryService'
import { deactivateEmployee, getEmployees } from '../../services/employeeService'
import { getDepartments } from '../../services/departmentService'

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [country, setCountry] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('created_at')
  const [order, setOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [formEmployee, setFormEmployee] = useState(null)
  const [confirmEmployee, setConfirmEmployee] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [notice, setNotice] = useState(null)
  const search = useDebouncedValue(searchTerm)

  const query = { search, country, department, status, sort, order, page, per_page: 10 }
  const { data: response, loading, error, retry } = useAsync(() => getEmployees(query), JSON.stringify(query))
  const { data: filterOptions, loading: filtersLoading, error: filtersError, retry: retryFilters } = useAsync(async () => {
    const [countriesResponse, departmentsResponse] = await Promise.all([
      getCountries({ per_page: 100 }),
      getDepartments({ per_page: 100 }),
    ])
    return { countries: countriesResponse.data || [], departments: departmentsResponse.data || [] }
  })
  const rows = response?.data || []
  const countries = filterOptions?.countries || []
  const departments = filterOptions?.departments || []

  function handleSort(field) {
    if (sort === field) setOrder((value) => value === 'asc' ? 'desc' : 'asc')
    else { setSort(field); setOrder('asc') }
    setPage(1)
  }

  function handleSaved(employee) {
    const action = formEmployee?.id ? 'updated' : 'added'
    setFormEmployee(null)
    setNotice({ type: 'success', message: `${employee.first_name} ${employee.last_name} was ${action} successfully.` })
    retry()
  }

  async function handleDeactivate() {
    if (!confirmEmployee) return
    setActionLoading(true)
    setNotice(null)
    try {
      await deactivateEmployee(confirmEmployee.id)
      setConfirmEmployee(null)
      setNotice({ type: 'success', message: `${confirmEmployee.first_name} ${confirmEmployee.last_name} was marked inactive.` })
      retry()
    } catch (requestError) {
      setNotice({ type: 'error', message: getApiErrorMessage(requestError) })
    } finally {
      setActionLoading(false)
    }
  }

  const columns = [
    { key: 'employee_code', label: 'Employee', sortable: true, sortKey: 'first_name', render: (row) => <div><Link to={`/employees/${row.id}`} className="font-semibold text-slate-800 hover:text-blue-700">{row.first_name} {row.last_name}</Link><p className="text-xs text-slate-400">{row.employee_code}</p></div> },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'designation', label: 'Designation' },
    { key: 'country', label: 'Country', render: (row) => row.country?.name || '—' },
    { key: 'department', label: 'Department', render: (row) => row.department?.name || '—' },
    { key: 'status', label: 'Status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
    { key: 'actions', label: 'Actions', render: (row) => <div className="flex items-center gap-1"><Link to={`/employees/${row.id}`} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="View employee" aria-label={`View ${row.first_name} ${row.last_name}`}><Eye size={16} /></Link><button type="button" onClick={() => setFormEmployee(row)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Edit employee" aria-label={`Edit ${row.first_name} ${row.last_name}`}><Pencil size={16} /></button>{row.status === 'active' && <button type="button" onClick={() => setConfirmEmployee(row)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Deactivate employee" aria-label={`Deactivate ${row.first_name} ${row.last_name}`}><UserRoundX size={16} /></button>}</div> },
  ]

  return <div>
    <PageHeader title="Employees" description="Browse and manage your workforce directory." action={<Button onClick={() => setFormEmployee({})}><Plus size={17} /> Add employee</Button>} />
    {notice && <div className={`mb-5 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`} role="status"><span className="flex items-center gap-2">{notice.type === 'success' && <CheckCircle2 size={17} />}{notice.message}</span><button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification"><X size={16} /></button></div>}
    <SectionCard title="Employee directory" description="Search, filter, sort and review employee records.">
      <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input id="employee-search" label="Search" placeholder="Name, email or code..." value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPage(1) }} />
        <Select id="employee-country" label="Country" value={country} onChange={(event) => { setCountry(event.target.value); setPage(1) }} options={[{ value: '', label: filtersLoading ? 'Loading countries...' : 'All countries' }, ...countries.map((item) => ({ value: item.id, label: item.name }))]} />
        <Select id="employee-department" label="Department" value={department} onChange={(event) => { setDepartment(event.target.value); setPage(1) }} options={[{ value: '', label: filtersLoading ? 'Loading departments...' : 'All departments' }, ...departments.map((item) => ({ value: item.id, label: item.name }))]} />
        <Select id="employee-status" label="Status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} options={[{ value: '', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
        <div className="flex items-end"><Button type="button" variant="secondary" className="w-full" onClick={() => { setSearchTerm(''); setCountry(''); setDepartment(''); setStatus(''); setPage(1) }}><Filter size={16} /> Clear filters</Button></div>
      </div>
      {filtersError && <div className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-xs text-amber-700">Filter options could not load. <button type="button" className="font-semibold underline" onClick={retryFilters}>Retry</button></div>}
      {loading ? <LoadingSpinner label="Loading employees..." /> : error ? <ErrorState message={error} onRetry={retry} /> : <DataTable rows={rows} onSort={handleSort} sortKey={sort} sortOrder={order} empty={<EmptyState title="No employees found" description={search || country || department || status ? 'Try changing your search or filters.' : 'Employee records from the API will appear here.'} />} columns={columns} />}
      {!loading && !error && <Pagination meta={response?.meta} onPageChange={setPage} />}
    </SectionCard>
    <Modal open={Boolean(formEmployee)} title={formEmployee?.id ? 'Edit employee' : 'Add employee'} onClose={() => setFormEmployee(null)} size="lg"><EmployeeForm employee={formEmployee?.id ? formEmployee : null} onCancel={() => setFormEmployee(null)} onSaved={handleSaved} /></Modal>
    <ConfirmationDialog open={Boolean(confirmEmployee)} title="Deactivate employee?" description={`This will mark ${confirmEmployee?.first_name || 'this employee'} ${confirmEmployee?.last_name || ''} as inactive. Their salary history will be preserved.`} onCancel={() => setConfirmEmployee(null)} onConfirm={handleDeactivate} loading={actionLoading} />
  </div>
}
