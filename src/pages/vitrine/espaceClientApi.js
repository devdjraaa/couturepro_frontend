// P202 : API de l'espace client vitrine (auth sans mot de passe : Google ou OTP e-mail).
// Jeton Sanctum client stocké en localStorage (gx_client_token), isolé des comptes pro.
import { API_BASE_URL } from '@/constants/config'

const TOKEN_KEY = 'gx_client_token'

export function getClientToken() {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

export function setClientToken(token) {
  try { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY) } catch { /* stockage indisponible */ }
}

async function call(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { Accept: 'application/json' }
  if (body) headers['Content-Type'] = 'application/json'
  const token = auth ? getClientToken() : null
  if (token) headers.Authorization = `Bearer ${token}`
  try {
    const r = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
    const data = await r.json().catch(() => ({}))
    if (r.status === 401 && auth) setClientToken(null) // jeton périmé → retour à la connexion
    return { ok: r.ok, status: r.status, data }
  } catch {
    return { ok: false, status: 0, data: {} }
  }
}

// Contexte d'acquisition capturé à la connexion (UTM + referrer + appareil) — P202 §1.1.
function contexte() {
  try {
    const p = new URLSearchParams(window.location.search)
    return {
      utm_source:   p.get('utm_source')   || undefined,
      utm_medium:   p.get('utm_medium')   || undefined,
      utm_campaign: p.get('utm_campaign') || undefined,
      referrer_url: document.referrer ? document.referrer.slice(0, 255) : undefined,
      appareil:     /mobile|android|iphone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      navigateur:   navigator.userAgent.slice(0, 60),
      langue:       navigator.language?.slice(0, 10),
    }
  } catch {
    return {}
  }
}

export const demanderOtp  = (email) => call('/vitrine/client/otp/demander', { method: 'POST', body: { email } })
export const verifierOtp  = (email, code) => call('/vitrine/client/otp/verifier', { method: 'POST', body: { email, code, ...contexte() } })
export const loginGoogle  = (idToken) => call('/vitrine/client/google', { method: 'POST', body: { id_token: idToken, ...contexte() } })
export const getMe        = () => call('/vitrine/client/me', { auth: true })
export const majProfil    = (profil) => call('/vitrine/client/me', { method: 'PATCH', body: profil, auth: true })
export const envoyerConsentement = (consent) => call('/vitrine/client/consentement', { method: 'POST', body: consent, auth: true })
export const clientLogout = async () => { await call('/vitrine/client/logout', { method: 'POST', auth: true }); setClientToken(null) }

export const getMesCommandes = () => call('/vitrine/client/commandes', { auth: true })
export const commander       = (atelierId, instructions) => call('/vitrine/client/commandes', { method: 'POST', body: { atelier_id: atelierId, instructions }, auth: true })
export const laisserAvis     = (commandeId, note, texte) => call(`/vitrine/client/commandes/${commandeId}/avis`, { method: 'POST', body: { note, texte }, auth: true })
export const reclamer        = (commandeId, sujet, message) => call(`/vitrine/client/commandes/${commandeId}/reclamation`, { method: 'POST', body: { sujet, message }, auth: true })

// Config publique (client ID Google + IDs analytics) — servie par l'API, rien de figé.
export const getConfigPublique = () => call('/auth/social/providers')
