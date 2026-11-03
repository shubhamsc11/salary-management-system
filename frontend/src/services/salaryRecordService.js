import api from '../api'

export async function getEmployeeSalaryRecords(employeeId, params = {}) {
  const response = await api.get(`/employees/${employeeId}/salary_records`, { params })
  return response.data
}

export async function getSalaryRecord(id) {
  const response = await api.get(`/salary_records/${id}`)
  return response.data
}

export async function createSalaryRecord(employeeId, salaryRecord) {
  const response = await api.post(`/employees/${employeeId}/salary_records`, { salary_record: salaryRecord })
  return response.data
}

export async function updateSalaryRecord(id, salaryRecord) {
  const response = await api.patch(`/salary_records/${id}`, { salary_record: salaryRecord })
  return response.data
}

export async function deleteSalaryRecord(id) {
  const response = await api.delete(`/salary_records/${id}`)
  return response.data
}
