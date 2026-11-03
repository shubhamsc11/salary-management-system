import api from '../api'

export async function getCountries(params = {}) {
  const response = await api.get('/countries', { params })
  return response.data
}

export async function createCountry(country) {
  const response = await api.post('/countries', { country })
  return response.data
}

export async function updateCountry(id, country) {
  const response = await api.patch(`/countries/${id}`, { country })
  return response.data
}

export async function deleteCountry(id) {
  const response = await api.delete(`/countries/${id}`)
  return response.data
}
