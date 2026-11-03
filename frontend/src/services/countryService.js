import api from '../api'

export async function getCountries(params = {}) {
  const response = await api.get('/countries', { params })
  return response.data
}
