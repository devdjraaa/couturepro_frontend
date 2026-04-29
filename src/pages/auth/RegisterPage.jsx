import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts'
import { AuthLayout } from '@/components/layout'
import { Input, Button, Select } from '@/components/ui'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { register, verifyOtp, resendOtp } = useAuth()

  const QUESTIONS_SECRETE = [
    { value: 'Quel est le nom de votre premier animal de compagnie ?', label: 'Nom de votre premier animal de compagnie ?' },
    { value: 'Quel est le prénom de votre meilleure amie d\'enfance ?', label: 'Prénom de votre meilleure amie d\'enfance ?' },
    { value: 'Quelle est la ville où vous êtes né(e) ?', label: 'Ville de naissance ?' },
    { value: 'Quel est le nom de votre école primaire ?', label: 'Nom de votre école primaire ?' },
  ]
  const [step, setStep] = useState('form') // 'form' | 'otp'
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    nom_atelier: '',
    password: '',
    password_confirmation: '',
    question_secrete: QUESTIONS_SECRETE[0].value,
    reponse_secrete: '',
  })
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleRegister = async e => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password_confirmation) {
      setError(t('auth.inscription.mdp_non_concordants'))
      return
    }
    setLoading(true)
    try {
      await register(form)
      setStep('otp')
    } catch (err) {
      setError(err.message || t('erreurs.inconnu'))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyOtp({ telephone: form.telephone, code: otp })
      navigate('/onboarding', { replace: true })
    } catch (err) {
      setError(err.message || t('erreurs.otp_invalide'))
    } finally {
      setLoading(false)
    }
  }

  if (step === 'otp') {
    return (
      <AuthLayout subtitle={t('auth.otp.sous_titre_tel', { telephone: form.telephone })}>
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <Input
            label={t('auth.otp.code')}
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            placeholder="000000"
            maxLength={6}
            required
          />
          {error && <p className="text-sm text-danger text-center">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            {t('auth.otp.verifier')}
          </Button>
          <button
            type="button"
            onClick={() => resendOtp(form.telephone)}
            className="w-full text-sm text-dim underline py-2"
          >
            {t('auth.otp.renvoyer')}
          </button>
        </form>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout subtitle={t('auth.inscription.sous_titre_register')}>
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('commun.prenom')}
            value={form.prenom}
            onChange={set('prenom')}
            placeholder="Aminata"
            required
          />
          <Input
            label={t('commun.nom')}
            value={form.nom}
            onChange={set('nom')}
            placeholder="Diallo"
            required
          />
        </div>
        <Input
          label={t('commun.telephone')}
          type="tel"
          value={form.telephone}
          onChange={set('telephone')}
          placeholder="+225 07 00 00 00 00"
          required
        />
        <Input
          label={t('commun.email')}
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="aminata@atelier.com"
          required
        />
        <Input
          label={t('auth.inscription.nom_atelier')}
          value={form.nom_atelier}
          onChange={set('nom_atelier')}
          placeholder="Atelier Aminata"
          required
        />
        <Input
          label={t('auth.inscription.mot_de_passe')}
          type="password"
          value={form.password}
          onChange={set('password')}
          placeholder="••••••••"
          required
        />
        <Input
          label={t('auth.inscription.confirmer_mot_de_passe')}
          type="password"
          value={form.password_confirmation}
          onChange={set('password_confirmation')}
          placeholder="••••••••"
          required
        />
        <Select
          label={t('auth.inscription.question_secrete')}
          value={form.question_secrete}
          onChange={set('question_secrete')}
          options={QUESTIONS_SECRETE}
          required
        />
        <Input
          label={t('auth.inscription.reponse_secrete')}
          value={form.reponse_secrete}
          onChange={set('reponse_secrete')}
          placeholder={t('auth.inscription.reponse_secrete_placeholder')}
          required
        />
        {error && <p className="text-sm text-danger text-center">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>
          {t('auth.inscription.creer_compte')}
        </Button>
        <p className="text-center text-sm text-dim">
          {t('auth.inscription.deja_inscrit')}{' '}
          <Link to="/login" className="text-primary font-medium">
            {t('auth.inscription.se_connecter')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
