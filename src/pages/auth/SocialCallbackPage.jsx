import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'

// P150 : atterrissage après connexion sociale. Le token arrive dans le fragment (#token=…),
// on le consomme pour ouvrir la session puis on redirige vers l'app.
export default function SocialCallbackPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const [error, setError] = useState(false)

  useEffect(() => {
    const m = (window.location.hash || '').match(/token=([^&]+)/)
    const token = m ? decodeURIComponent(m[1]) : null
    if (!token) { setError(true); return }
    loginWithToken(token)
      .then(() => navigate(ROUTES.DASHBOARD, { replace: true }))
      .catch(() => setError(true))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-dvh flex items-center justify-center p-6 text-center bg-app">
      {error ? (
        <div>
          <p className="text-sm text-error mb-3">{t('auth.social.erreur')}</p>
          <button onClick={() => navigate(ROUTES.LOGIN, { replace: true })} className="text-primary font-semibold text-sm hover:underline">
            {t('auth.social.retour_login')}
          </button>
        </div>
      ) : (
        <p className="text-dim text-sm">{t('auth.social.connexion')}</p>
      )}
    </div>
  )
}
