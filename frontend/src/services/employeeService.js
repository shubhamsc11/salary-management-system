import api from '../api'

export async function getEmployees(params = {}) {
  const response = await api.get('/employees', { params })
  return response.data
}

export async function getEmployee(id) {
  const response = await api.get(`/employees/${id}`)
  return response.data
}
