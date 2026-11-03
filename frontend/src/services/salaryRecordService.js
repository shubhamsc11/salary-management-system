import api from '../api'

export async function getEmployeeSalaryRecords(employeeId, params = {}) {
  const response = await api.get(`/employees/${employeeId}/salary_records`, { params })
  return response.data
}

export async function getSalaryRecord(id) {
  const response = await api.get(`/salary_records/${id}`)
  return response.data
}
