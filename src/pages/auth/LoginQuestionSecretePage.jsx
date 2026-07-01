import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, HelpCircle } from 'lucide-react'
import { authService } from '@/services/authService'
import { AuthLayout } from '@/components/layout'
import { Input, Button } from '@/components/ui'
import { ROUTES } from '@/constants/routes'

export default function LoginQuestionSecretePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

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
      await authService.loginParQuestionSecrete({ telephone, reponse_secrete: reponse })
      window.location.href = ROUTES.DASHBOARD
    } catch (err) {
      setError(err?.message || t('auth.question_secrete.reponse_incorrecte'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout subtitle={t('auth.question_secrete.sous_titre')}>

      {/* Icône or */}
      <div className="flex flex-col items-center mb-6 gap-2">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--color-gold-soft)', border: '1px solid var(--color-hair-gold)' }}
        >
          <HelpCircle size={22} style={{ color: 'var(--color-gold)' }} />
        </div>
        <p className="text-sm text-dim text-center">
          {step === 'telephone'
            ? t('auth.question_secrete.instruction_tel')
            : t('auth.question_secrete.instruction_reponse')}
        </p>
      </div>

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

          {error && (
            <p className="text-sm text-danger text-center py-1.5 px-3 rounded-xl bg-danger/10 border border-danger/20">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" loading={loading} iconRight={ArrowRight}>
            {t('commun.suivant')}
          </Button>

          <p className="text-center text-sm">
            <Link to="/login" className="font-semibold" style={{ color: 'var(--color-gold)' }}>
              ← {t('auth.mot_de_passe_oublie.retour_connexion')}
            </Link>
          </p>
        </form>
      )}

      {step === 'reponse' && (
        <form onSubmit={handleReponse} className="space-y-4">
          {/* Carte question */}
          <div
            className="rounded-xl p-3"
            style={{ background: 'var(--color-gold-soft)', border: '1px solid var(--color-hair-gold)' }}
          >
            <p className="text-[10px] font-bold tracking-[.18em] uppercase mb-1" style={{ color: 'var(--color-gold)' }}>
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

          {error && (
            <p className="text-sm text-danger text-center py-1.5 px-3 rounded-xl bg-danger/10 border border-danger/20">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" loading={loading} iconRight={ArrowRight}>
            {t('auth.connexion.se_connecter')}
          </Button>

          <p className="text-center text-sm">
            <button
              type="button"
              onClick={() => { setStep('telephone'); setReponse(''); setError('') }}
              className="font-semibold transition-colors"
              style={{ color: 'var(--color-gold)' }}
            >
              ← {t('commun.precedent')}
            </button>
          </p>
        </form>
      )}
    </AuthLayout>
  )
}
