import { useState } from 'react'
import { sanitizePhoneInput } from '@/utils/phoneInput'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { authService } from '@/services/authService'
import { AuthLayout } from '@/components/layout'
import { Input, Button } from '@/components/ui'
import { ROUTES } from '@/constants/routes'

export default function RecoverAccountPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const isSimple  = location.state?.simple === true
  const STEPS = isSimple
    ? [t('auth.recuperer_compte.etape_1'), t('auth.recuperer_compte.etape_4')]
    : [
        t('auth.recuperer_compte.etape_1'),
        t('auth.recuperer_compte.etape_2'),
        t('auth.recuperer_compte.etape_3'),
        t('auth.recuperer_compte.etape_4'),
      ]

  const email     = location.state?.email ?? ''
  const initialId = location.state?.demande_id ?? null

  const [step, setStep]           = useState(2)
  const [demandeId]               = useState(initialId)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [otp1, setOtp1]           = useState('')
  const [tel, setTel]             = useState('')
  const [otp2, setOtp2]           = useState('')
  const [password, setPassword]   = useState('')
  const [confirmPwd, setConfirm]  = useState('')
  const [showPwd, setShowPwd]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  if (!email || !demandeId) {
    return (
      <AuthLayout subtitle={t('auth.recuperer_compte.session_expiree')}>
        <p className="text-sm text-dim text-center mb-5">
          {t('auth.recuperer_compte.session_expiree_message')}
        </p>
        <Link
          to="/mot-de-passe-oublie"
          className="block w-full text-center text-sm font-semibold"
          style={{ color: 'var(--color-gold)' }}
        >
          {t('commun.reessayer')}
        </Link>
      </AuthLayout>
    )
  }

  const visualIndex = isSimple ? (step === 2 ? 0 : 1) : (step - 2)
  const stepLabel   = STEPS[visualIndex] ?? ''

  const handleStep2 = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.recuperationEtape2({ demande_id: demandeId, code: otp1 })
      setStep(isSimple ? 5 : 3)
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
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (err) {
      setError(err?.message || t('erreurs.inconnu'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout subtitle={stepLabel}>

      {/* Barre de progression fil d'or */}
      <div className="flex gap-1.5 mb-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{
              background: i < visualIndex
                ? 'var(--color-gold)'
                : i === visualIndex
                  ? 'var(--color-primary)'
                  : 'var(--color-border-edge)',
            }}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-danger text-center py-1.5 px-3 rounded-xl bg-danger/10 border border-danger/20 mb-4">
          {error}
        </p>
      )}

      {/* Étape 2 : OTP email */}
      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-4">
          <p className="text-sm text-dim text-center">
            {t('auth.recuperer_compte.otp_email_instruction', { email })}
          </p>
          <input
            type="text"
            inputMode="numeric"
            value={otp1}
            onChange={e => setOtp1(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="— — — — — —"
            maxLength={6}
            required
            className="w-full h-16 bg-elevated border border-edge rounded-2xl text-center text-2xl tracking-[.5em] font-mono font-bold text-ink input-couture-focus transition-colors duration-150 placeholder:text-ghost placeholder:tracking-normal"
          />
          <Button type="submit" size="lg" className="w-full" loading={loading} iconRight={ArrowRight}>
            {t('auth.otp.verifier')}
          </Button>
        </form>
      )}

      {/* Étape 3 : Nouveau numéro */}
      {step === 3 && (
        <form onSubmit={handleStep3} className="space-y-4">
          <p className="text-sm text-dim text-center">
            {t('auth.recuperer_compte.nouveau_tel_instruction', { email })}
          </p>
          <Input
            label={t('auth.recuperer_compte.nouveau_numero')}
            type="text"
            inputMode="tel"
            value={tel}
            onChange={e => setTel(sanitizePhoneInput(e.target.value))}
            placeholder="ex : +229 97 00 00 00"
            required
          />
          <Button type="submit" size="lg" className="w-full" loading={loading} iconRight={ArrowRight}>
            {t('auth.recuperer_compte.continuer')}
          </Button>
        </form>
      )}

      {/* Étape 4 : OTP nouveau numéro */}
      {step === 4 && (
        <form onSubmit={handleStep4} className="space-y-4">
          <p className="text-sm text-dim text-center">
            {t('auth.recuperer_compte.confirmer_tel_instruction', { email, tel })}
          </p>
          <input
            type="text"
            inputMode="numeric"
            value={otp2}
            onChange={e => setOtp2(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="— — — — — —"
            maxLength={6}
            required
            className="w-full h-16 bg-elevated border border-edge rounded-2xl text-center text-2xl tracking-[.5em] font-mono font-bold text-ink input-couture-focus transition-colors duration-150 placeholder:text-ghost placeholder:tracking-normal"
          />
          <Button type="submit" size="lg" className="w-full" loading={loading} iconRight={ArrowRight}>
            {t('auth.otp.verifier')}
          </Button>
        </form>
      )}

      {/* Étape 5 : Nouveau mot de passe */}
      {step === 5 && (
        <form onSubmit={handleStep5} className="space-y-4">
          <p className="section-label">{t('commun.securite') || 'Sécurité'}</p>
          <Input
            label={t('auth.recuperer_compte.nouveau_mot_de_passe')}
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            suffix={
              <button type="button" tabIndex={-1} onClick={() => setShowPwd(v => !v)} className="hover:text-ink transition-colors">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <Input
            label={t('auth.inscription.confirmer_mot_de_passe')}
            type={showConfirm ? 'text' : 'password'}
            value={confirmPwd}
            onChange={e => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
            error={confirmPwd && password !== confirmPwd ? t('auth.inscription.mdp_non_concordants') : undefined}
            suffix={
              <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)} className="hover:text-ink transition-colors">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <Button type="submit" size="lg" className="w-full" loading={loading} iconRight={ArrowRight}>
            {t('commun.enregistrer')}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
