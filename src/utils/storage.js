const KEYS = {
  TOKEN:        'cp_token',
  THEME:        'cp_theme',
  ATELIER_ID:   'cp_atelier_id',
  LANG:         'cp_lang',
  SESSION:      'cp_session_cache',
}

// ── Token d'authentification ──
export function getToken()        { return localStorage.getItem(KEYS.TOKEN) }
export function setToken(token)   { localStorage.setItem(KEYS.TOKEN, token) }
export function clearToken()      { localStorage.removeItem(KEYS.TOKEN) }

// ── Cache de session offline (CDC : 30 jours, revalidation tous les 7j) ──
export function getCachedSession() {
  try {
    const raw = localStorage.getItem(KEYS.SESSION)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function setCachedSession({ user, atelier }) {
  const now = Date.now()
  const prev = getCachedSession()
  localStorage.setItem(KEYS.SESSION, JSON.stringify({
    user,
    atelier,
    cached_at:         prev?.cached_at ?? now,
    last_validated_at: now,
  }))
}

export function clearCachedSession() {
  localStorage.removeItem(KEYS.SESSION)
}

// ── Thème ──
export function getTheme()        { return localStorage.getItem(KEYS.THEME) || 'light' }
export function setTheme(theme)   { localStorage.setItem(KEYS.THEME, theme) }

// ── Atelier actif (multi-ateliers Phase 2) ──
export function getAtelierId()    { return localStorage.getItem(KEYS.ATELIER_ID) }
export function setAtelierId(id)  { localStorage.setItem(KEYS.ATELIER_ID, id) }

// ── Langue ──
export function getLang()         { return localStorage.getItem(KEYS.LANG) || 'fr' }
export function setLang(lang)     { localStorage.setItem(KEYS.LANG, lang) }

// ── Token admin (séparé du token proprietaire) ──
const ADMIN_TOKEN_KEY = 'cp_admin_token'
export function getAdminToken()        { return localStorage.getItem(ADMIN_TOKEN_KEY) }
export function setAdminToken(token)   { localStorage.setItem(ADMIN_TOKEN_KEY, token) }
export function clearAdminToken()      { localStorage.removeItem(ADMIN_TOKEN_KEY) }

// ── Réinitialisation complète (déconnexion) ──
export function clearAll() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
}

// Constantes CDC §1.2 — Offline-First
const DAY_MS = 24 * 60 * 60 * 1000
export const MAX_OFFLINE_GERANT_MS    = 30 * DAY_MS  // CDC §1.2 : 30 jours pour le Gérant
export const MAX_OFFLINE_EQUIPE_MS    = 7  * DAY_MS  // CDC §1.2 et §4.4 : 7 jours pour Assistant/Membre
export const REVALIDATE_AFTER_MS      = 7  * DAY_MS  // tentative de revalidation après 7j

// Retourne la limite offline selon le rôle (defaults: gérant)
export function getMaxOfflineMs(role) {
  return (role === 'assistant' || role === 'membre') ? MAX_OFFLINE_EQUIPE_MS : MAX_OFFLINE_GERANT_MS
}
