import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/authService'
import { API_BASE_URL } from '@/constants/config'
import { IS_NATIVE } from '@/constants/routes'

// P150 : boutons de connexion sociale. N'apparaissent que pour les providers réellement
// configurés côté serveur (clés .env) → tant qu'il n'y a pas de clés, rien ne s'affiche.
// Web uniquement pour l'instant (le flux natif Capacitor viendra ensuite).
const LABELS = { google: 'Google', facebook: 'Facebook', apple: 'Apple' }

export default function SocialLoginButtons() {
  const { t } = useTranslation()
  const [providers, setProviders] = useState([])

  useEffect(() => {
    if (IS_NATIVE) return
    let alive = true
    authService.getSocialProviders().then((list) => { if (alive) setProviders(list) })
    return () => { alive = false }
  }, [])

  if (IS_NATIVE || providers.length === 0) return null

  return (
    <div className="mt-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-edge" />
        <span className="text-xs text-ghost">{t('auth.social.ou')}</span>
        <div className="flex-1 h-px bg-edge" />
      </div>
      <div className="space-y-2">
        {providers.map((p) => (
          <a
            key={p}
            href={`${API_BASE_URL}/auth/social/${p}/redirect`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-edge bg-card text-sm font-semibold text-ink hover:border-primary hover:text-primary transition"
          >
            {t('auth.social.continuer', { provider: LABELS[p] ?? p })}
          </a>
        ))}
      </div>
    </div>
  )
}
