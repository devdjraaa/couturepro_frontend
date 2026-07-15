import axios from 'axios'
import i18n from '@/lang/i18n'
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
    if (error.response?.status === 401 && getToken()) {
      clearAll()
      window.location.href = '/login'
    }
    return Promise.reject(normalizeError(error))
  }
)

// P112-113 : ne JAMAIS exposer de message technique brut à l'utilisateur.
// - Les messages backend (data.message) sont déjà localisés en FR côté serveur → on les garde.
// - Sinon on retombe sur un message convivial i18n (jamais `error.message` d'axios, ni la trace 500).
const tErr = (key) => i18n.t(`erreurs.${key}`)

function normalizeError(error) {
  if (!error.response) return { code: 'reseau', message: tErr('reseau') }
  const { status, data } = error.response
  const msg = typeof data?.message === 'string' ? data.message : null
  if (status === 401) return { code: 'session_expiree', message: msg || tErr('session_expiree') }
  // serverCode : code sémantique optionnel fourni par le backend (ex. telephone_non_verifie) — sans écraser le code HTTP.
  if (status === 403) return { code: 'non_autorise', serverCode: typeof data?.code === 'string' ? data.code : undefined, message: msg || tErr('non_autorise') }
  if (status === 404) return { code: 'non_trouve', message: msg || tErr('non_trouve') }
  if (status === 422) return { code: 'validation', errors: data?.errors, message: msg || tErr('format_invalide') }
  if (status === 429) return { code: 'quota_depasse', message: msg || tErr('quota_depasse') }
  // 500+ : Laravel renvoie « Server Error » (technique) en prod → on force un message convivial.
  if (status >= 500) return { code: 'serveur', message: tErr('serveur') }
  return { code: 'inconnu', message: msg || tErr('inconnu') }
}

export default api
