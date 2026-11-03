import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export function getApiErrorMessage(error) {
  if (!error.response) {
    return 'The API is unreachable. Check that the Rails server is running and try again.'
  }

  const errors = error.response.data?.errors
  if (Array.isArray(errors) && errors.length > 0) {
    const firstError = errors[0]
    if (firstError.detail) return firstError.detail
    const messages = Object.values(firstError).flat()
    if (messages.length > 0) return messages.join(', ')
  }

  return 'Something went wrong while loading this data.'
}

export function getApiValidationErrors(error) {
  const firstError = error.response?.data?.errors?.[0]
  if (!firstError || typeof firstError !== 'object') return {}

  return Object.fromEntries(
    Object.entries(firstError).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.join(', ') : String(messages),
    ]),
  )
}

export default api
