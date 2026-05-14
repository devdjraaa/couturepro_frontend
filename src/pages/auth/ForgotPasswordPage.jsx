import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/authService'
import { AuthLayout } from '@/components/layout'
import { Input, Button } from '@/components/ui'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [telephone, setTelephone] = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

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
      <p className="text-sm text-content-secondary text-center mb-4">
        {t('auth.mot_de_passe_oublie.instruction_tel')}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          {t('auth.mot_de_passe_oublie.envoyer')}
        </Button>

        {/* Alternative : recovery via question secrète (style Google "essayer autrement") */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-edge"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-ghost">{t('commun.ou')}</span>
          </div>
        </div>
        <Link
          to="/recuperer-compte/question-secrete"
          className="block w-full text-center py-2.5 text-sm font-medium text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors"
        >
          {t('auth.mot_de_passe_oublie.essayer_question_secrete')}
        </Link>

        <p className="text-center text-sm text-content-secondary">
          <Link to="/login" className="text-primary font-medium">{t('auth.mot_de_passe_oublie.retour_connexion')}</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
