const KEYS = {
  TOKEN:      'cp_token',
  THEME:      'cp_theme',
  ATELIER_ID: 'cp_atelier_id',
  LANG:       'cp_lang',
}

// ── Token d'authentification ──
export function getToken()        { return localStorage.getItem(KEYS.TOKEN) }
export function setToken(token)   { localStorage.setItem(KEYS.TOKEN, token) }
export function clearToken()      { localStorage.removeItem(KEYS.TOKEN) }

// ── Thème ──
export function getTheme()        { return localStorage.getItem(KEYS.THEME) || 'light' }
export function setTheme(theme)   { localStorage.setItem(KEYS.THEME, theme) }

// ── Atelier actif (multi-ateliers Phase 2) ──
export function getAtelierId()    { return localStorage.getItem(KEYS.ATELIER_ID) }
export function setAtelierId(id)  { localStorage.setItem(KEYS.ATELIER_ID, id) }

// ── Langue ──
export function getLang()         { return localStorage.getItem(KEYS.LANG) || 'fr' }
export function setLang(lang)     { localStorage.setItem(KEYS.LANG, lang) }

// ── Réinitialisation complète (déconnexion) ──
export function clearAll() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
}
