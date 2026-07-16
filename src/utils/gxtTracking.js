// P202 Phase 3 : tracking métier vitrine.
// - Événements MÉTIER (vue produit, panier, wishlist, achat, recherche…) → API interne,
//   envoyés PAR LOTS (sendBeacon) : 1 requête par lot, jamais 1 par clic.
// - Micro-événements (scroll, temps de page) → GA4 uniquement (pas en base).
// - GA4 / Meta Pixel / Clarity ne se chargent QUE si le visiteur a consenti (APDP) ET
//   que l'ID correspondant est configuré côté serveur (zéro hardcoding).
import { API_BASE_URL } from '@/constants/config'
import { getClientToken } from '@/pages/vitrine/espaceClientApi'

const SESSION_KEY = 'gx_session_id'
const FLUSH_MS = 15000
const MAX_LOT = 50

let queue = []
let timer = null

function sessionId() {
  try {
    let s = sessionStorage.getItem(SESSION_KEY)
    if (!s) {
      s = (crypto?.randomUUID?.() || `s-${Date.now()}-${Math.random().toString(36).slice(2)}`).slice(0, 64)
      sessionStorage.setItem(SESSION_KEY, s)
    }
    return s
  } catch {
    return 'anon'
  }
}

function appareil() {
  return /mobile|android|iphone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
}

/** Enfile un événement métier (type = whitelist serveur). Flush automatique. */
export function track(type, data = {}) {
  queue.push({ type, ...data })
  if (queue.length >= MAX_LOT) flush()
  else if (!timer) timer = setTimeout(flush, FLUSH_MS)
}

/** Envoie le lot courant (sendBeacon si possible : survit à la fermeture de l'onglet). */
export function flush() {
  if (timer) { clearTimeout(timer); timer = null }
  if (!queue.length) return
  const lot = queue.splice(0, MAX_LOT)
  const payload = JSON.stringify({ session_id: sessionId(), appareil: appareil(), evenements: lot })
  const url = `${API_BASE_URL}/vitrine/evenements`

  // sendBeacon n'accepte pas d'en-tête Authorization : si un client est connecté,
  // on passe par fetch keepalive pour lui attribuer l'événement.
  const token = getClientToken()
  if (!token && navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }))
    return
  }
  fetch(url, {
    method: 'POST', keepalive: true,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: payload,
  }).catch(() => {})
}

// Flush quand l'onglet se cache/ferme (dernier lot jamais perdu).
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush() })
  window.addEventListener('pagehide', flush)
}

/* ── Scripts tiers sous consentement ─────────────────────────────────────────── */

let tiersCharges = false

/**
 * Charge GA4 / Meta Pixel / Clarity selon le consentement et les IDs configurés.
 * consent: { analytics_consent, marketing_consent } — ids: { ga4_id, meta_pixel_id, clarity_id }.
 */
export function initAnalyticsTiers(consent, ids = {}) {
  if (tiersCharges || !consent) return
  const analytics = !!consent.analytics_consent
  const marketing = !!consent.marketing_consent
  if (!analytics && !marketing) return
  tiersCharges = true

  if (analytics && ids.ga4_id) {
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ids.ga4_id)}`
    document.head.appendChild(s)
    window.dataLayer = window.dataLayer || []
    window.gtag = function () { window.dataLayer.push(arguments) }
    window.gtag('js', new Date())
    window.gtag('config', ids.ga4_id, { anonymize_ip: true })
  }

  if (analytics && ids.clarity_id) {
    // Snippet officiel Microsoft Clarity (heatmaps + sessions).
    ;(function (c, l, a, r, i) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) }
      const t = l.createElement(r); t.async = 1; t.src = `https://www.clarity.ms/tag/${i}`
      const y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y)
    })(window, document, 'clarity', 'script', ids.clarity_id)
  }

  if (marketing && ids.meta_pixel_id) {
    // Snippet officiel Meta Pixel (reciblage).
    ;(function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = []
      t = b.createElement(e); t.async = true; t.src = v
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
    window.fbq('init', ids.meta_pixel_id)
    window.fbq('track', 'PageView')
  }
}

/** Relais GA4 (no-op si non chargé/pas de consentement). */
export function ga4(event, params = {}) {
  try { window.gtag?.('event', event, params) } catch { /* non chargé */ }
}

/** Relais Meta Pixel (no-op si non chargé/pas de consentement). */
export function pixel(event, params = {}, custom = false) {
  try { custom ? window.fbq?.('trackCustom', event, params) : window.fbq?.('track', event, params) } catch { /* non chargé */ }
}
