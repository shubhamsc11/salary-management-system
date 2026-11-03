import api from '../api'

export async function getDepartments(params = {}) {
  const response = await api.get('/departments', { params })
  return response.data
}

export async function createDepartment(department) {
  const response = await api.post('/departments', { department })
  return response.data
}

export async function updateDepartment(id, department) {
  const response = await api.patch(`/departments/${id}`, { department })
  return response.data
}

export async function deleteDepartment(id) {
  const response = await api.delete(`/departments/${id}`)
  return response.data
}
