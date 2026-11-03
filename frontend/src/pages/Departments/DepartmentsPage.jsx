import { useState } from 'react'
import DataTable from '../../components/common/DataTable'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import Input from '../../components/common/Input'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import SectionCard from '../../components/common/SectionCard'
import useAsync from '../../hooks/useAsync'
import { getDepartments } from '../../services/departmentService'

export default function DepartmentsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data: response, loading, error, retry } = useAsync(() => getDepartments({ search, page, per_page: 10 }), `${search}:${page}`)
  const rows = response?.data || []
  return <div><PageHeader title="Departments" description="Organize employees by the teams and functions they support." /><SectionCard title="Department directory" description="Search existing department records."><div className="border-b border-slate-100 p-4"><Input id="department-search" placeholder="Search departments..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></div>{loading ? <LoadingSpinner label="Loading departments..." /> : error ? <ErrorState message={error} onRetry={retry} /> : <DataTable rows={rows} empty={<EmptyState title="No departments found" />} columns={[{ key: 'name', label: 'Department', render: (row) => <span className="font-semibold text-slate-800">{row.name}</span> }, { key: 'id', label: 'Reference', render: (row) => <span className="font-mono text-xs text-slate-400">#{row.id}</span> }]} />}{!loading && !error && <Pagination meta={response?.meta} onPageChange={setPage} />}</SectionCard></div>
}
