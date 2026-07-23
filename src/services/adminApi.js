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
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
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
  // Même correctif que le client pro : on garde `status` et `data`, sinon les
  // écrans qui lisaient `err.response.data.*` n'avaient plus rien à lire.
  const base = { status, data }
  if (status === 401) return { ...base, code: 'session_expiree', message: data?.message }
  if (status === 403) return { ...base, code: 'non_autorise', message: data?.message }
  if (status === 404) return { ...base, code: 'non_trouve', message: data?.message }
  if (status === 422) return { ...base, code: 'validation', errors: data?.errors, message: data?.message }
  if (status >= 500) return { ...base, code: 'serveur', message: data?.message }
  return { ...base, code: 'inconnu', message: data?.message || error.message }
}

export default adminApi
