import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Button from '../common/Button'
import Input from '../common/Input'
import { getApiErrorMessage, getApiValidationErrors } from '../../api'

const schemas = {
  country: z.object({ name: z.string().trim().min(1, 'Country name is required.'), code: z.string().trim().length(2, 'Code must be 2 letters.').regex(/^[A-Za-z]{2}$/, 'Code must contain letters only.'), currency_code: z.string().trim().length(3, 'Currency code must be 3 letters.').regex(/^[A-Za-z]{3}$/, 'Currency code must contain letters only.') }),
  department: z.object({ name: z.string().trim().min(1, 'Department name is required.') }),
}

export default function ResourceForm({ type, resource, onCancel, onSaved, createResource, updateResource }) {
  const [submitError, setSubmitError] = useState('')
  const isEditing = Boolean(resource?.id)
  const form = useForm({ resolver: zodResolver(schemas[type]), defaultValues: useMemo(() => resource ? (type === 'country' ? { name: resource.name || '', code: resource.code || '', currency_code: resource.currency_code || '' } : { name: resource.name || '' }) : (type === 'country' ? { name: '', code: '', currency_code: '' } : { name: '' }), [resource, type]) })
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = form

  useEffect(() => { reset(resource ? (type === 'country' ? { name: resource.name || '', code: resource.code || '', currency_code: resource.currency_code || '' } : { name: resource.name || '' }) : (type === 'country' ? { name: '', code: '', currency_code: '' } : { name: '' })) }, [resource, type, reset])

  async function onSubmit(values) {
    setSubmitError('')
    const payload = type === 'country' ? { ...values, code: values.code.toUpperCase(), currency_code: values.currency_code.toUpperCase() } : values
    try {
      const response = isEditing ? await updateResource(resource.id, payload) : await createResource(payload)
      onSaved(response.data)
    } catch (error) {
      const validationErrors = getApiValidationErrors(error)
      Object.entries(validationErrors).forEach(([field, message]) => setError(field, { type: 'server', message }))
      setSubmitError(Object.keys(validationErrors).length ? 'Please review the highlighted fields.' : getApiErrorMessage(error))
    }
  }

  return <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
    {submitError && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{submitError}</div>}
    <div className="grid gap-4 sm:grid-cols-2"><Input id={`${type}-name`} label={type === 'country' ? 'Country name' : 'Department name'} placeholder={type === 'country' ? 'e.g. India' : 'e.g. Engineering'} error={errors.name?.message} {...register('name')} />{type === 'country' && <><Input id="country-code" label="Country code" maxLength={2} placeholder="IN" error={errors.code?.message} {...register('code')} /><Input id="currency-code" label="Currency code" maxLength={3} placeholder="INR" error={errors.currency_code?.message} {...register('currency_code')} /></>}</div>
    <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit" loading={isSubmitting}>{isEditing ? 'Save changes' : `Add ${type}`}</Button></div>
  </form>
}
