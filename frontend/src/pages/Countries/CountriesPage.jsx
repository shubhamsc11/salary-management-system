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
import { getCountries } from '../../services/countryService'

export default function CountriesPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data: response, loading, error, retry } = useAsync(() => getCountries({ search, page, per_page: 10 }), `${search}:${page}`)
  const rows = response?.data || []
  return <div><PageHeader title="Countries" description="Manage the countries represented in your organization." /><SectionCard title="Country directory" description="Search existing country records."><div className="border-b border-slate-100 p-4"><Input id="country-search" placeholder="Search by country name or code..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></div>{loading ? <LoadingSpinner label="Loading countries..." /> : error ? <ErrorState message={error} onRetry={retry} /> : <DataTable rows={rows} empty={<EmptyState title="No countries found" />} columns={[{ key: 'name', label: 'Country', render: (row) => <span className="font-semibold text-slate-800">{row.name}</span> }, { key: 'code', label: 'Code', render: (row) => <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{row.code}</span> }, { key: 'currency_code', label: 'Currency' }]} />}{!loading && !error && <Pagination meta={response?.meta} onPageChange={setPage} />}</SectionCard></div>
}
