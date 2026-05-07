import axios from 'axios'
import { API_BASE_URL } from '@/constants/config'
import { getToken, clearAll } from '@/utils/storage'

const ACTIVE_ATELIER_KEY = 'cp_active_atelier'
export const getActiveAtelierId = () => localStorage.getItem(ACTIVE_ATELIER_KEY)
export const setActiveAtelierId = (id) => id
  ? localStorage.setItem(ACTIVE_ATELIER_KEY, id)
  : localStorage.removeItem(ACTIVE_ATELIER_KEY)

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use(config => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  const activeAtelierId = getActiveAtelierId()
  if (activeAtelierId) config.headers['X-Atelier-Id'] = activeAtelierId
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearAll()
      window.location.href = '/login'
    }
    return Promise.reject(normalizeError(error))
  }
)

function normalizeError(error) {
  if (!error.response) return { code: 'reseau', message: error.message }
  const { status, data } = error.response
  if (status === 401) return { code: 'session_expiree', message: data?.message }
  if (status === 403) return { code: 'non_autorise', message: data?.message }
  if (status === 404) return { code: 'non_trouve', message: data?.message }
  if (status === 422) return { code: 'validation', errors: data?.errors, message: data?.message }
  if (status === 429) return { code: 'quota_depasse', message: data?.message }
  if (status >= 500) return { code: 'serveur', message: data?.message }
  return { code: 'inconnu', message: data?.message || error.message }
}

export default api
