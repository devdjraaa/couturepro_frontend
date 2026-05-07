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
          type="tel"
          value={telephone}
          onChange={e => setTelephone(e.target.value)}
          placeholder="+225 07 00 00 00 00"
          required
        />
        {error && <p className="text-sm text-danger text-center">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>
          {t('auth.mot_de_passe_oublie.envoyer')}
        </Button>
        <p className="text-center text-sm text-content-secondary">
          <Link to="/login" className="text-primary font-medium">{t('auth.mot_de_passe_oublie.retour_connexion')}</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
