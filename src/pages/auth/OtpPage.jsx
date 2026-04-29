import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts'
import { AuthLayout } from '@/components/layout'
import { Input, Button } from '@/components/ui'

export default function OtpPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { t } = useTranslation()
  const { verifyOtp, resendOtp } = useAuth()

  const telephone = location.state?.telephone ?? ''
  const [code, setCode]     = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [resent, setResent]  = useState(false)

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-content-secondary text-center">
          {t('auth.otp.instruction')}
        </p>
        <Input
          label={t('auth.otp.code')}
          type="text"
          inputMode="numeric"
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          maxLength={6}
          required
          className="text-center tracking-widest text-lg font-mono"
        />
        {error && <p className="text-sm text-danger text-center">{error}</p>}
        {resent && <p className="text-sm text-success text-center">{t('auth.otp.renvoye_succes')}</p>}
        <Button type="submit" className="w-full" loading={loading}>
          {t('auth.otp.verifier')}
        </Button>
        <button
          type="button"
          onClick={handleResend}
          className="w-full text-sm text-content-secondary underline py-2"
        >
          {t('auth.otp.renvoyer')}
        </button>
      </form>
    </AuthLayout>
  )
}
