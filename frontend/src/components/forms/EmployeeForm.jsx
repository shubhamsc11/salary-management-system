import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Button from '../common/Button'
import ErrorState from '../common/ErrorState'
import Input from '../common/Input'
import LoadingSpinner from '../common/LoadingSpinner'
import Select from '../common/Select'
import { getApiErrorMessage, getApiValidationErrors } from '../../api'
import useAsync from '../../hooks/useAsync'
import { getCountries } from '../../services/countryService'
import { getDepartments } from '../../services/departmentService'
import { createEmployee, updateEmployee } from '../../services/employeeService'

const employeeSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required.'),
  last_name: z.string().trim().min(1, 'Last name is required.'),
  email: z.string().trim().email('Enter a valid email address.'),
  employee_code: z.string().trim().min(1, 'Employee code is required.'),
  country_id: z.coerce.number().int().positive('Country is required.'),
  department_id: z.coerce.number().int().positive('Department is required.'),
  designation: z.string().trim().min(1, 'Designation is required.'),
  joining_date: z.string().min(1, 'Joining date is required.'),
  status: z.enum(['active', 'inactive']),
})

const blankValues = {
  first_name: '',
  last_name: '',
  email: '',
  employee_code: '',
  country_id: '',
  department_id: '',
  designation: '',
  joining_date: '',
  status: 'active',
}

function defaultValues(employee) {
  if (!employee) return blankValues
  return {
    first_name: employee.first_name || '',
    last_name: employee.last_name || '',
    email: employee.email || '',
    employee_code: employee.employee_code || '',
    country_id: employee.country?.id?.toString() || '',
    department_id: employee.department?.id?.toString() || '',
    designation: employee.designation || '',
    joining_date: employee.joining_date || '',
    status: employee.status || 'active',
  }
}

export default function EmployeeForm({ employee, onCancel, onSaved }) {
  const [submitError, setSubmitError] = useState('')
  const isEditing = Boolean(employee?.id)
  const { data: options, loading: optionsLoading, error: optionsError, retry: retryOptions } = useAsync(async () => {
    const [countriesResponse, departmentsResponse] = await Promise.all([
      getCountries({ per_page: 100 }),
      getDepartments({ per_page: 100 }),
    ])
    return { countries: countriesResponse.data || [], departments: departmentsResponse.data || [] }
  })
  const form = useForm({ resolver: zodResolver(employeeSchema), defaultValues: useMemo(() => defaultValues(employee), [employee]) })
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = form

  useEffect(() => {
    reset(defaultValues(employee))
  }, [employee, reset])

  const countryOptions = [{ value: '', label: 'Select country' }, ...(options?.countries || []).map((country) => ({ value: country.id, label: `${country.name} (${country.code})` }))]
  const departmentOptions = [{ value: '', label: 'Select department' }, ...(options?.departments || []).map((department) => ({ value: department.id, label: department.name }))]

  async function onSubmit(values) {
    setSubmitError('')
    try {
      const response = isEditing ? await updateEmployee(employee.id, values) : await createEmployee(values)
      onSaved(response.data)
    } catch (error) {
      const validationErrors = getApiValidationErrors(error)
      Object.entries(validationErrors).forEach(([field, message]) => setError(field, { type: 'server', message }))
      setSubmitError(Object.keys(validationErrors).length ? 'Please review the highlighted fields.' : getApiErrorMessage(error))
    }
  }

  if (optionsLoading) return <LoadingSpinner label="Loading form options..." />
  if (optionsError) return <ErrorState message={optionsError} onRetry={retryOptions} />

  return <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
    {submitError && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{submitError}</div>}
    <div className="grid gap-4 sm:grid-cols-2">
      <Input id="first_name" label="First name" placeholder="e.g. Asha" error={errors.first_name?.message} {...register('first_name')} />
      <Input id="last_name" label="Last name" placeholder="e.g. Sharma" error={errors.last_name?.message} {...register('last_name')} />
      <Input id="email" type="email" label="Email" placeholder="name@company.com" error={errors.email?.message} {...register('email')} />
      <Input id="employee_code" label="Employee code" placeholder="EMP-001" error={errors.employee_code?.message} {...register('employee_code')} />
      <Select id="country_id" label="Country" options={countryOptions} error={errors.country_id?.message} {...register('country_id')} />
      <Select id="department_id" label="Department" options={departmentOptions} error={errors.department_id?.message} {...register('department_id')} />
      <Input id="designation" label="Designation" placeholder="e.g. Software Engineer" error={errors.designation?.message} {...register('designation')} />
      <Input id="joining_date" type="date" label="Joining date" error={errors.joining_date?.message} {...register('joining_date')} />
      <Select id="status" label="Status" options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} error={errors.status?.message} {...register('status')} />
    </div>
    <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
      <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      <Button type="submit" loading={isSubmitting}>{isEditing ? 'Save changes' : 'Add employee'}</Button>
    </div>
  </form>
}
