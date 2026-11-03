import api from '../api'

export async function getDepartments(params = {}) {
  const response = await api.get('/departments', { params })
  return response.data
}
