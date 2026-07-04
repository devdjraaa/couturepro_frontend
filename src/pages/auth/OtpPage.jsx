import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, MessageSquare } from 'lucide-react'
import { useAuth } from '@/contexts'
import { AuthLayout } from '@/components/layout'
import { Button } from '@/components/ui'

export default function OtpPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { t } = useTranslation()
  const { verifyOtp, resendOtp } = useAuth()

  const telephone = location.state?.telephone ?? ''
  const [code, setCode]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [resent, setResent]   = useState(false)

  if (!telephone) {
    navigate('/login', { replace: true })
    return null
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyOtp({ telephone, code })
      navigate('/onboarding', { replace: true })
    } catch (err) {
      setError(err?.message || t('erreurs.otp_invalide'))
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await resendOtp(telephone)
      setResent(true)
      setTimeout(() => setResent(false), 4000)
    } catch { /* ignore */ }
  }

  return (
    <AuthLayout subtitle={t('auth.otp.sous_titre_tel', { telephone })}>

      {/* Icône or + instruction */}
      <div className="flex flex-col items-center mb-6 gap-2">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--color-gold-soft)', border: '1px solid var(--color-hair-gold)' }}
        >
          <MessageSquare size={22} style={{ color: 'var(--color-gold)' }} />
        </div>
        <p className="text-sm text-dim text-center">
          {t('auth.otp.instruction')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Grand champ OTP centré */}
        <input
          type="text"
          inputMode="numeric"
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="— — — — — —"
          maxLength={6}
          required
          className="w-full h-16 bg-elevated border border-edge rounded-2xl text-center text-2xl tracking-[.5em] font-mono font-bold text-ink input-couture-focus transition-colors duration-150 placeholder:text-ghost placeholder:tracking-normal"
        />

        {error && (
          <p className="text-sm text-danger text-center py-1.5 px-3 rounded-xl bg-danger/10 border border-danger/20">
            {error}
          </p>
        )}

        {resent && (
          <p className="text-sm text-success text-center py-1.5 px-3 rounded-xl bg-success/10 border border-success/20">
            {t('auth.otp.renvoye_succes')}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={loading} iconRight={ArrowRight}>
          {t('auth.otp.verifier')}
        </Button>

        <div className="flex flex-col items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleResend}
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--color-gold)' }}
          >
            {t('auth.otp.renvoyer')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm text-ghost hover:text-dim transition-colors"
          >
            ← {t('auth.mot_de_passe_oublie.retour_connexion')}
          </button>
        </div>
      </form>
    </AuthLayout>
  )
}
