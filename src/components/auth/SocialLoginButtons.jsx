import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Capacitor } from '@capacitor/core'
import { authService } from '@/services/authService'
import { useAuth } from '@/contexts'
import { API_BASE_URL } from '@/constants/config'
import { IS_NATIVE, ROUTES } from '@/constants/routes'

// P150 : boutons de connexion sociale. N'apparaissent que pour les providers réellement
// configurés côté serveur (clés .env) → tant qu'il n'y a pas de clés, rien ne s'affiche.
// - Web : redirection OAuth classique (backend → provider → callback).
// - Natif (cette branche android) : flux Google Credential Manager via le plugin
//   (Google interdit l'OAuth dans les WebView), idToken vérifié par le backend.
const LABELS = { google: 'Google', facebook: 'Facebook', apple: 'Apple' }

export default function SocialLoginButtons() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const [cfg, setCfg] = useState({ providers: [], google_web_client_id: null })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    authService.getSocialConfig().then((c) => { if (alive) setCfg(c) })
    return () => { alive = false }
  }, [])

  // En natif, seul Google est câblé pour l'instant (Credential Manager).
  // Garde : le plugin n'existe que dans les APK ≥ 1.0.10 — sur un vieil APK
  // (bundle OTA plus récent que le natif), on masque le bouton plutôt que d'échouer.
  const pluginOk = !IS_NATIVE || Capacitor.isPluginAvailable('SocialLogin')
  const providers = IS_NATIVE
    ? (pluginOk ? cfg.providers.filter((p) => p === 'google' && cfg.google_web_client_id) : [])
    : cfg.providers

  if (providers.length === 0) return null

  const nativeGoogle = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const { googleNativeLogin } = await import('@/utils/socialNative')
      const idToken = await googleNativeLogin(cfg.google_web_client_id)
      const res = await authService.socialTokenLogin('google', idToken)
      if (res.status === 'ok') {
        await loginWithToken(res.token)
        navigate(ROUTES.DASHBOARD, { replace: true })
      } else if (res.status === 'inscription') {
        const q = new URLSearchParams({
          social: 'google',
          email: res.email ?? '', prenom: res.prenom ?? '', nom: res.nom ?? '',
        })
        navigate(`${ROUTES.REGISTER}?${q.toString()}`)
      }
    } catch {
      // Annulation par l'utilisateur ou échec réseau — message discret, pas bloquant.
      setError(t('auth.social.erreur'))
    } finally {
      setBusy(false)
    }
  }

  const btnCls = 'flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-edge bg-card text-sm font-semibold text-ink hover:border-primary hover:text-primary transition disabled:opacity-60'

  return (
    <div className="mt-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-edge" />
        <span className="text-xs text-ghost">{t('auth.social.ou')}</span>
        <div className="flex-1 h-px bg-edge" />
      </div>
      <div className="space-y-2">
        {providers.map((p) => (
          IS_NATIVE ? (
            <button key={p} type="button" onClick={nativeGoogle} disabled={busy} className={btnCls}>
              {busy ? t('auth.social.connexion') : t('auth.social.continuer', { provider: LABELS[p] ?? p })}
            </button>
          ) : (
            <a key={p} href={`${API_BASE_URL}/auth/social/${p}/redirect`} className={btnCls}>
              {t('auth.social.continuer', { provider: LABELS[p] ?? p })}
            </a>
          )
        ))}
      </div>
      {error && <p className="text-xs text-error mt-2 text-center">{error}</p>}
    </div>
  )
}
