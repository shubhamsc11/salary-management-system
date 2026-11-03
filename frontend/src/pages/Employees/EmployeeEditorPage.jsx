import { useNavigate, useParams } from 'react-router-dom'
import EmployeeForm from '../../components/forms/EmployeeForm'
import ErrorState from '../../components/common/ErrorState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PageHeader from '../../components/common/PageHeader'
import SectionCard from '../../components/common/SectionCard'
import useAsync from '../../hooks/useAsync'
import { getEmployee } from '../../services/employeeService'

export default function EmployeeEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const { data: response, loading, error, retry } = useAsync(() => isEditing ? getEmployee(id) : Promise.resolve({ data: null }), id || 'new')
  const employee = response?.data

  if (loading) return <><PageHeader title={isEditing ? 'Edit employee' : 'Add employee'} /><SectionCard><LoadingSpinner label="Loading employee form..." /></SectionCard></>
  if (error) return <><PageHeader title="Employee form" /><SectionCard><ErrorState message={error} onRetry={retry} /></SectionCard></>

  return <div><PageHeader title={isEditing ? 'Edit employee' : 'Add employee'} description="Keep employee information accurate and up to date." /><SectionCard><div className="p-5 sm:p-7"><EmployeeForm employee={employee} onCancel={() => navigate(-1)} onSaved={(savedEmployee) => navigate(`/employees/${savedEmployee.id}`)} /></div></SectionCard></div>
}
