import { useState } from 'react'
import { sanitizePhoneInput } from '@/utils/phoneInput'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Phone } from 'lucide-react'
import { authService } from '@/services/authService'
import { AuthLayout } from '@/components/layout'
import { Input, Button } from '@/components/ui'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [telephone, setTelephone] = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { demande_id, email } = await authService.recuperationEtape1({ telephone })
      navigate('/recuperer-compte', { state: { email, demande_id, simple: true } })
    } catch (err) {
      setError(err?.message || t('erreurs.non_trouve'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout subtitle={t('auth.mot_de_passe_oublie.sous_titre_mdp')}>

      {/* Icône + instruction */}
      <div className="flex flex-col items-center mb-6 gap-2">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-100)' }}
        >
          <Phone size={22} className="text-primary" />
        </div>
        <p className="text-sm text-dim text-center">
          {t('auth.mot_de_passe_oublie.instruction_tel')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('commun.telephone')}
          type="text"
          inputMode="tel"
          value={telephone}
          onChange={e => setTelephone(sanitizePhoneInput(e.target.value))}
          placeholder="ex : +229 97 00 00 00"
          required
        />

        {error && (
          <p className="text-sm text-danger text-center py-1.5 px-3 rounded-xl bg-danger/10 border border-danger/20">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={loading} iconRight={ArrowRight}>
          {t('auth.mot_de_passe_oublie.envoyer')}
        </Button>

        {/* Séparateur fil d'or */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--color-hair-gold), transparent)' }} />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 text-ghost" style={{ background: 'var(--color-bg-card)' }}>
              {t('commun.ou')}
            </span>
          </div>
        </div>

        <Link
          to="/recuperer-compte/question-secrete"
          className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold transition-colors"
          style={{
            border: '1px solid var(--color-hair-gold)',
            color: 'var(--color-gold)',
            background: 'var(--color-gold-soft)',
          }}
        >
          {t('auth.mot_de_passe_oublie.essayer_question_secrete')}
        </Link>

        <p className="text-center text-sm">
          <Link to="/login" className="font-semibold" style={{ color: 'var(--color-gold)' }}>
            ← {t('auth.mot_de_passe_oublie.retour_connexion')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
