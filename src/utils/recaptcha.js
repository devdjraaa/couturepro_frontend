// P196 : reCAPTCHA v3 côté client. Inactif tant que la site key n'est pas fournie
// par l'API (getSocialConfig.recaptcha_site_key) → l'inscription reste ouverte.
let scriptPromise = null

function loadScript(siteKey) {
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    if (window.grecaptcha) return resolve()
    const s = document.createElement('script')
    s.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('recaptcha_load_failed'))
    document.head.appendChild(s)
  })
  return scriptPromise
}

/**
 * Retourne un jeton reCAPTCHA v3 pour l'action donnée, ou null si non configuré
 * (pas de site key) ou en cas d'échec (on n'empêche jamais l'utilisateur : le
 * serveur laisse passer quand reCAPTCHA n'est pas configuré).
 */
export async function getRecaptchaToken(siteKey, action = 'inscription') {
  if (!siteKey) return null
  try {
    await loadScript(siteKey)
    await new Promise((r) => window.grecaptcha.ready(r))
    return await window.grecaptcha.execute(siteKey, { action })
  } catch {
    return null
  }
}
