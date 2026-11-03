import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import Button from '../common/Button'
import ErrorState from '../common/ErrorState'
import Input from '../common/Input'
import Select from '../common/Select'
import { getApiErrorMessage, getApiValidationErrors } from '../../api'
import { createSalaryRecord, updateSalaryRecord } from '../../services/salaryRecordService'

const salarySchema = z.object({
  employee_id: z.coerce.number().int().positive('Employee is required.'),
  basic_salary: z.coerce.number().finite().nonnegative('Basic salary cannot be negative.'),
  bonus: z.coerce.number().finite().nonnegative('Bonus cannot be negative.'),
  allowances: z.coerce.number().finite().nonnegative('Allowances cannot be negative.'),
  deductions: z.coerce.number().finite().nonnegative('Deductions cannot be negative.'),
  currency: z.string().trim().length(3, 'Use a 3-letter currency code.').regex(/^[A-Za-z]{3}$/, 'Use letters only.'),
  effective_from: z.string().min(1, 'Effective from is required.'),
  effective_to: z.string().optional(),
}).superRefine((values, context) => {
  if (values.effective_to && values.effective_from && values.effective_to < values.effective_from) {
    context.addIssue({ code: 'custom', path: ['effective_to'], message: 'Effective to must be on or after effective from.' })
  }
})

const blankValues = {
  employee_id: '', basic_salary: '', bonus: '0', allowances: '0', deductions: '0', currency: 'INR', effective_from: '', effective_to: '',
}

function getDefaults(record, employeeId) {
  if (!record) return { ...blankValues, employee_id: employeeId || '', effective_from: new Date().toISOString().slice(0, 10) }
  return {
    employee_id: record.employee_id?.toString() || employeeId || '',
    basic_salary: record.basic_salary ?? '', bonus: record.bonus ?? '0', allowances: record.allowances ?? '0', deductions: record.deductions ?? '0',
    currency: record.currency || 'INR', effective_from: record.effective_from || '', effective_to: record.effective_to || '',
  }
}

export default function SalaryRecordForm({ record, employeeId, employeeOptions, onCancel, onSaved }) {
  const [submitError, setSubmitError] = useState('')
  const isEditing = Boolean(record?.id)
  const form = useForm({ resolver: zodResolver(salarySchema), defaultValues: useMemo(() => getDefaults(record, employeeId), [record, employeeId]) })
  const { register, handleSubmit, reset, setError, control, formState: { errors, isSubmitting } } = form
  const values = useWatch({ control })
  const netSalary = [values.basic_salary, values.bonus, values.allowances].reduce((sum, value) => sum + (Number(value) || 0), 0) - (Number(values.deductions) || 0)

  useEffect(() => {
    reset(getDefaults(record, employeeId))
  }, [record, employeeId, reset])

  async function onSubmit(formValues) {
    setSubmitError('')
    const payload = { ...formValues, employee_id: undefined, currency: formValues.currency.toUpperCase() }
    delete payload.employee_id
    try {
      const response = isEditing ? await updateSalaryRecord(record.id, payload) : await createSalaryRecord(formValues.employee_id, payload)
      onSaved(response.data)
    } catch (error) {
      const validationErrors = getApiValidationErrors(error)
      Object.entries(validationErrors).forEach(([field, message]) => setError(field, { type: 'server', message }))
      setSubmitError(Object.keys(validationErrors).length ? 'Please review the highlighted fields.' : getApiErrorMessage(error))
    }
  }

  if (!employeeOptions.length && !isEditing) return <ErrorState message="No employees are available for a salary record." />

  return <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
    {submitError && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{submitError}</div>}
    <div className="grid gap-4 sm:grid-cols-2">
      <Select id="salary-employee-id" label="Employee" disabled={isEditing} options={[{ value: '', label: 'Select employee' }, ...employeeOptions.map((employee) => ({ value: employee.id, label: `${employee.first_name} ${employee.last_name} · ${employee.employee_code}` }))]} error={errors.employee_id?.message} {...register('employee_id')} />
      <Input id="salary-currency" label="Currency" maxLength={3} placeholder="INR" error={errors.currency?.message} {...register('currency')} />
      <Input id="basic_salary" type="number" min="0" step="0.01" label="Basic salary" error={errors.basic_salary?.message} {...register('basic_salary')} />
      <Input id="bonus" type="number" min="0" step="0.01" label="Bonus" error={errors.bonus?.message} {...register('bonus')} />
      <Input id="allowances" type="number" min="0" step="0.01" label="Allowances" error={errors.allowances?.message} {...register('allowances')} />
      <Input id="deductions" type="number" min="0" step="0.01" label="Deductions" error={errors.deductions?.message} {...register('deductions')} />
      <Input id="effective_from" type="date" label="Effective from" error={errors.effective_from?.message} {...register('effective_from')} />
      <Input id="effective_to" type="date" label="Effective to" hint="Leave blank for the current open-ended record." error={errors.effective_to?.message} {...register('effective_to')} />
    </div>
    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Net salary preview</p><p className="mt-1 text-2xl font-bold text-blue-950">{netSalary.toLocaleString()} <span className="text-sm font-semibold">{String(values.currency || '').toUpperCase()}</span></p><p className="mt-1 text-xs text-blue-700">The backend remains the source of truth.</p></div>
    <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit" loading={isSubmitting}>{isEditing ? 'Save changes' : 'Add salary record'}</Button></div>
  </form>
}
