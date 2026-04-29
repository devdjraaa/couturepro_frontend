import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/authService'
import { AuthLayout } from '@/components/layout'
import { Input, Button } from '@/components/ui'

export default function RecoverAccountPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const STEPS = [
    t('auth.recuperer_compte.etape_1'),
    t('auth.recuperer_compte.etape_2'),
    t('auth.recuperer_compte.etape_3'),
    t('auth.recuperer_compte.etape_4'),
  ]

  const email      = location.state?.email ?? ''
  const initialId  = location.state?.demande_id ?? null

  const [step, setStep]         = useState(2) // steps 2 → 5
  const [demandeId, setDemandeId] = useState(initialId)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const [otp1, setOtp1]         = useState('')
  const [tel, setTel]           = useState('')
  const [otp2, setOtp2]         = useState('')
  const [password, setPassword] = useState('')
  const [confirmPwd, setConfirm] = useState('')

  if (!email || !demandeId) {
    return (
      <AuthLayout subtitle={t('auth.recuperer_compte.session_expiree')}>
        <p className="text-sm text-content-secondary text-center mb-4">
          {t('auth.recuperer_compte.session_expiree_message')}
        </p>
        <Link to="/mot-de-passe-oublie" className="block w-full text-center text-primary font-medium underline">
          {t('commun.reessayer')}
        </Link>
      </AuthLayout>
    )
  }

  const stepLabel = STEPS[step - 2] ?? ''

  const handleStep2 = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.recuperationEtape2({ demande_id: demandeId, code: otp1 })
      setStep(3)
    } catch (err) {
      setError(err?.message || t('erreurs.otp_invalide'))
    } finally {
      setLoading(false)
    }
  }

  const handleStep3 = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.recuperationEtape3({ demande_id: demandeId, telephone_nouveau: tel })
      setStep(4)
    } catch (err) {
      setError(err?.message || t('erreurs.format_invalide'))
    } finally {
      setLoading(false)
    }
  }

  const handleStep4 = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.recuperationEtape4({ demande_id: demandeId, code: otp2 })
      setStep(5)
    } catch (err) {
      setError(err?.message || t('erreurs.otp_invalide'))
    } finally {
      setLoading(false)
    }
  }

  const handleStep5 = async e => {
    e.preventDefault()
    setError('')
    if (password !== confirmPwd) { setError(t('auth.inscription.mdp_non_concordants')); return }
    setLoading(true)
    try {
      await authService.recuperationEtape5({ demande_id: demandeId, password, password_confirmation: confirmPwd })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.message || t('erreurs.inconnu'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout subtitle={stepLabel}>
      {/* Indicateur d'étape */}
      <div className="flex gap-1 mb-5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < step - 2 ? 'bg-success' : i === step - 2 ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>

      {error && <p className="text-sm text-danger text-center mb-3">{error}</p>}

      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-4">
          <p className="text-sm text-content-secondary text-center">
            {t('auth.recuperer_compte.otp_email_instruction', { email })}
          </p>
          <Input
            label={t('auth.otp.code')}
            type="text"
            inputMode="numeric"
            value={otp1}
            onChange={e => setOtp1(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            required
            className="text-center tracking-widest font-mono"
          />
          <Button type="submit" className="w-full" loading={loading}>{t('auth.otp.verifier')}</Button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleStep3} className="space-y-4">
          <p className="text-sm text-content-secondary text-center">
            {t('auth.recuperer_compte.nouveau_tel_instruction', { email })}
          </p>
          <Input
            label={t('auth.recuperer_compte.nouveau_numero')}
            type="tel"
            value={tel}
            onChange={e => setTel(e.target.value)}
            placeholder="+225 07 00 00 00 00"
            required
          />
          <Button type="submit" className="w-full" loading={loading}>{t('auth.recuperer_compte.continuer')}</Button>
        </form>
      )}

      {step === 4 && (
        <form onSubmit={handleStep4} className="space-y-4">
          <p className="text-sm text-content-secondary text-center">
            {t('auth.recuperer_compte.confirmer_tel_instruction', { email, tel })}
          </p>
          <Input
            label={t('auth.recuperer_compte.code_confirmation')}
            type="text"
            inputMode="numeric"
            value={otp2}
            onChange={e => setOtp2(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            required
            className="text-center tracking-widest font-mono"
          />
          <Button type="submit" className="w-full" loading={loading}>{t('auth.otp.verifier')}</Button>
        </form>
      )}

      {step === 5 && (
        <form onSubmit={handleStep5} className="space-y-4">
          <Input
            label={t('auth.recuperer_compte.nouveau_mot_de_passe')}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Input
            label={t('auth.inscription.confirmer_mot_de_passe')}
            type="password"
            value={confirmPwd}
            onChange={e => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" className="w-full" loading={loading}>{t('commun.enregistrer')}</Button>
        </form>
      )}
    </AuthLayout>
  )
}
