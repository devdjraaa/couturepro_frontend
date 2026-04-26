import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts'
import { AuthLayout } from '@/components/layout'
import { Input, Button } from '@/components/ui'

export default function OtpPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
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
      setError(err?.message || 'Code invalide ou expiré')
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
    <AuthLayout subtitle={`Code envoyé au ${telephone}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-content-secondary text-center">
          Entrez le code à 6 chiffres reçu par SMS.
        </p>
        <Input
          label="Code de vérification"
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
        {resent && <p className="text-sm text-success text-center">Code renvoyé !</p>}
        <Button type="submit" className="w-full" loading={loading}>
          Vérifier
        </Button>
        <button
          type="button"
          onClick={handleResend}
          className="w-full text-sm text-content-secondary underline py-2"
        >
          Renvoyer le code
        </button>
      </form>
    </AuthLayout>
  )
}
