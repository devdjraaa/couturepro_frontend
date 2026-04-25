import axios from 'axios'
import { API_BASE_URL } from '@/constants/config'
import { getAdminToken, clearAdminToken } from '@/utils/storage'

const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

adminApi.interceptors.request.use(config => {
  const token = getAdminToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

adminApi.interceptors.response.use(
  res => res,
  error => {
    if (error.response?.status === 401) {
      clearAdminToken()
      window.location.href = '/admin/login'
    }
    return Promise.reject(normalizeAdminError(error))
  }
)

function normalizeAdminError(error) {
  if (!error.response) return { code: 'reseau', message: error.message }
  const { status, data } = error.response
  if (status === 401) return { code: 'session_expiree', message: data?.message }
  if (status === 403) return { code: 'non_autorise', message: data?.message }
  if (status === 404) return { code: 'non_trouve', message: data?.message }
  if (status === 422) return { code: 'validation', errors: data?.errors, message: data?.message }
  if (status >= 500) return { code: 'serveur', message: data?.message }
  return { code: 'inconnu', message: data?.message || error.message }
}

export default adminApi
