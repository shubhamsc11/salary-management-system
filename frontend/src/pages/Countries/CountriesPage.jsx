import { CheckCircle2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import ResourceForm from '../../components/forms/ResourceForm'
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
import { getApiErrorMessage } from '../../api'
import useAsync from '../../hooks/useAsync'
import useDebouncedValue from '../../hooks/useDebouncedValue'
import { createCountry, deleteCountry, getCountries, updateCountry } from '../../services/countryService'

export default function CountriesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [formCountry, setFormCountry] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [notice, setNotice] = useState(null)
  const search = useDebouncedValue(searchTerm)
  const query = { search, page, per_page: 10 }
  const { data: response, loading, error, retry } = useAsync(() => getCountries(query), JSON.stringify(query))
  const rows = response?.data || []
  function handleSaved(country) { setFormCountry(null); setNotice({ type: 'success', message: `${country.name} was ${formCountry?.id ? 'updated' : 'added'} successfully.` }); retry() }
  async function handleDelete() { if (!deleteTarget) return; setActionLoading(true); try { await deleteCountry(deleteTarget.id); setDeleteTarget(null); setNotice({ type: 'success', message: 'Country deleted successfully.' }); retry() } catch (requestError) { setNotice({ type: 'error', message: getApiErrorMessage(requestError) }) } finally { setActionLoading(false) } }
  const columns = [{ key: 'name', label: 'Country', render: (row) => <span className="font-semibold text-slate-800">{row.name}</span> }, { key: 'code', label: 'Code', render: (row) => <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{row.code}</span> }, { key: 'currency_code', label: 'Currency' }, { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-1"><button type="button" onClick={() => setFormCountry(row)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" aria-label={`Edit ${row.name}`}><Pencil size={16} /></button><button type="button" onClick={() => setDeleteTarget(row)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${row.name}`}><Trash2 size={16} /></button></div> }]
  return <div><PageHeader title="Countries" description="Manage the countries represented in your organization." action={<Button onClick={() => setFormCountry({})}><Plus size={17} /> Add country</Button>} />{notice && <Notice notice={notice} onClose={() => setNotice(null)} />}<SectionCard title="Country directory" description="Search and maintain country reference data."><div className="border-b border-slate-100 p-4"><Input id="country-search" label="Search" placeholder="Search by country name or code..." value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPage(1) }} /></div>{loading ? <LoadingSpinner label="Loading countries..." /> : error ? <ErrorState message={error} onRetry={retry} /> : <DataTable rows={rows} empty={<EmptyState title="No countries found" />} columns={columns} />}{!loading && !error && <Pagination meta={response?.meta} onPageChange={setPage} />}</SectionCard><Modal open={Boolean(formCountry)} title={formCountry?.id ? 'Edit country' : 'Add country'} onClose={() => setFormCountry(null)}><ResourceForm type="country" resource={formCountry?.id ? formCountry : null} onCancel={() => setFormCountry(null)} onSaved={handleSaved} createResource={createCountry} updateResource={updateCountry} /></Modal><ConfirmationDialog open={Boolean(deleteTarget)} title="Delete country?" description={`Deleting ${deleteTarget?.name || 'this country'} is only allowed when no employees are associated with it.`} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={actionLoading} /></div>
}

function Notice({ notice, onClose }) { return <div className={`mb-5 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`} role="status"><span className="flex items-center gap-2">{notice.type === 'success' && <CheckCircle2 size={17} />}{notice.message}</span><button type="button" onClick={onClose} aria-label="Dismiss notification"><X size={16} /></button></div> }
