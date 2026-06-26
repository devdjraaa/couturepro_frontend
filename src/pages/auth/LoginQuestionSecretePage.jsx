import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/authService'
import { useAuth } from '@/contexts'
import { setCachedSession } from '@/utils/storage'
import { setDemoMode } from '@/services/mockFlag'
import { AuthLayout } from '@/components/layout'
import { Input, Button } from '@/components/ui'
import { ROUTES } from '@/constants/routes'

/**
 * Récupération via question secrète (style Google "essayer autrement").
 * Étape 1 : téléphone → backend retourne la question.
 * Étape 2 : réponse → backend valide + retourne un token → login direct.
 *
 * Pas de changement de mot de passe forcé : l'utilisateur garde son mdp
 * actuel (celui qu'il a oublié) et accède simplement à son compte.
 */
export default function LoginQuestionSecretePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  // On utilise le state interne du AuthContext en passant par un re-render via setCachedSession
  // (l'AuthContext lit le cache au montage). Pour éviter cette indirection, on peut aussi
  // exposer un setter ; ici on passe par un reload après login.
  // Ici on fait simple : login → setCachedSession + navigate('/'), AuthContext récupère
  // au prochain mount.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _auth = useAuth()

  const [step, setStep]           = useState('telephone') // 'telephone' | 'reponse'
  const [telephone, setTelephone] = useState('')
  const [question, setQuestion]   = useState('')
  const [reponse, setReponse]     = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  const handleTelephone = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { question_secrete } = await authService.getQuestionSecrete(telephone)
      setQuestion(question_secrete)
      setStep('reponse')
    } catch (err) {
      setError(err?.message || t('erreurs.non_trouve'))
    } finally {
      setLoading(false)
    }
  }

  const handleReponse = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user, atelier } = await authService.loginParQuestionSecrete({
        telephone,
        reponse_secrete: reponse,
      })
      setCachedSession({ user, atelier })
      setDemoMode(!!atelier?.is_demo)
      // Reload pour que AuthContext rehydrate depuis le cache + token fraîchement set
      window.location.href = '/'
    } catch (err) {
      setError(err?.message || t('auth.question_secrete.reponse_incorrecte'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout subtitle={t('auth.question_secrete.sous_titre')}>
      <p className="text-sm text-content-secondary text-center mb-4">
        {step === 'telephone'
          ? t('auth.question_secrete.instruction_tel')
          : t('auth.question_secrete.instruction_reponse')}
      </p>

      {step === 'telephone' && (
        <form onSubmit={handleTelephone} className="space-y-4">
          <Input
            label={t('commun.telephone')}
            type="text"
            inputMode="tel"
            value={telephone}
            onChange={e => setTelephone(e.target.value)}
            placeholder="ex : +229 97 00 00 00"
            required
          />
          {error && <p className="text-sm text-danger text-center">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            {t('commun.suivant')}
          </Button>
          <p className="text-center text-sm text-content-secondary">
            <Link to="/login" className="text-primary font-medium">
              {t('auth.mot_de_passe_oublie.retour_connexion')}
            </Link>
          </p>
        </form>
      )}

      {step === 'reponse' && (
        <form onSubmit={handleReponse} className="space-y-4">
          <div className="bg-subtle rounded-xl p-3">
            <p className="text-2xs font-medium text-ghost uppercase tracking-widest mb-1">
              {t('auth.question_secrete.votre_question')}
            </p>
            <p className="text-sm text-ink font-medium">{question}</p>
          </div>
          <Input
            label={t('auth.inscription.reponse_secrete')}
            value={reponse}
            onChange={e => setReponse(e.target.value)}
            placeholder={t('auth.inscription.reponse_secrete_placeholder')}
            required
            autoFocus
          />
          {error && <p className="text-sm text-danger text-center">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            {t('auth.connexion.se_connecter')}
          </Button>
          <p className="text-center text-sm text-content-secondary">
            <button
              type="button"
              onClick={() => { setStep('telephone'); setReponse(''); setError('') }}
              className="text-primary font-medium"
            >
              {t('commun.precedent')}
            </button>
          </p>
        </form>
      )}
    </AuthLayout>
  )
}
