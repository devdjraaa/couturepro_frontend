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
    // P35-36 : les uploads (photos tickets/tissus/galerie) dépassent facilement 15 s
    // sur réseau mobile lent → timeout étendu pour les requêtes multipart.
    config.timeout = 120000
  }
  return config
})

// Anti-éjection intempestive (signalé par la direction, web) : un 401 ne déconnecte
// QUE s'il correspond à une session RÉELLEMENT expirée. On le confirme par un appel
// léger authentifié : s'il passe, le 401 initial était transitoire (fenêtre de
// redéploiement, hoquet réseau, endpoint particulier) et on NE déconnecte PAS.
let verificationSessionEnCours = false

async function sessionReellementExpiree() {
  try {
    // `_verifSession` empêche la récursion de l'interceptor sur cette requête.
    await api.get('/abonnement/current', { _verifSession: true, timeout: 8000 })
    return false // token accepté → le 401 initial n'était pas un vrai problème d'auth
  } catch (e) {
    return e?.response?.status === 401 // vraie expiration seulement si la vérif 401 aussi
  }
}

api.interceptors.response.use(
  response => response,
  async error => {
    const cfg = error.config || {}
    if (error.response?.status === 401 && getToken() && !cfg._verifSession && !verificationSessionEnCours) {
      verificationSessionEnCours = true
      try {
        if (await sessionReellementExpiree()) {
          clearAll()
          window.location.href = '/login'
        }
      } finally {
        verificationSessionEnCours = false
      }
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
  // `status` et `data` sont CONSERVÉS : en ne renvoyant que { code, message }, on
  // jetait la charge utile du serveur alors que des écrans en dépendent — le
  // détail des problèmes de qualité, les erreurs de validation champ par champ,
  // le statut HTTP. Comme l'objet rejeté n'a plus de `.response`, tout écran qui
  // lisait `err.response.data.*` recevait `undefined` et retombait sur un message
  // générique : le quota d'équipe atteint s'affichait « Une erreur est survenue ».
  const base = { status, data }
  if (status === 401) return { ...base, code: 'session_expiree', message: msg || tErr('session_expiree') }
  // serverCode : code sémantique optionnel fourni par le backend (ex. telephone_non_verifie) — sans écraser le code HTTP.
  if (status === 403) return { ...base, code: 'non_autorise', serverCode: typeof data?.code === 'string' ? data.code : undefined, message: msg || tErr('non_autorise') }
  if (status === 404) return { ...base, code: 'non_trouve', message: msg || tErr('non_trouve') }
  if (status === 422) return { ...base, code: 'validation', errors: data?.errors, message: msg || tErr('format_invalide') }
  if (status === 429) return { ...base, code: 'quota_depasse', message: msg || tErr('quota_depasse') }
  // 500+ : Laravel renvoie « Server Error » (technique) en prod → on force un message convivial.
  if (status >= 500) return { ...base, code: 'serveur', message: tErr('serveur') }
  return { ...base, code: 'inconnu', message: msg || tErr('inconnu') }
}

export default api
