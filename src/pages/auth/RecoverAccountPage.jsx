import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { authService } from '@/services/authService'
import { AuthLayout } from '@/components/layout'
import { Input, Button } from '@/components/ui'

const STEPS = ['Vérifier le code', 'Nouveau numéro', 'Confirmer le numéro', 'Nouveau mot de passe']

export default function RecoverAccountPage() {
  const navigate = useNavigate()
  const location = useLocation()

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
      <AuthLayout subtitle="Session expirée">
        <p className="text-sm text-content-secondary text-center mb-4">
          Votre session de récupération a expiré. Recommencez.
        </p>
        <Link to="/mot-de-passe-oublie" className="block w-full text-center text-primary font-medium underline">
          Réessayer
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
      setError(err?.message || 'Code invalide ou expiré')
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
      setError(err?.message || 'Numéro invalide')
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
      setError(err?.message || 'Code invalide ou expiré')
    } finally {
      setLoading(false)
    }
  }

  const handleStep5 = async e => {
    e.preventDefault()
    setError('')
    if (password !== confirmPwd) { setError('Les mots de passe ne correspondent pas'); return }
    setLoading(true)
    try {
      await authService.recuperationEtape5({ demande_id: demandeId, password, password_confirmation: confirmPwd })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.message || 'Erreur lors de la mise à jour')
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
            Un code OTP a été envoyé à l'adresse <strong>{email}</strong>.
          </p>
          <Input
            label="Code de vérification"
            type="text"
            inputMode="numeric"
            value={otp1}
            onChange={e => setOtp1(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            required
            className="text-center tracking-widest font-mono"
          />
          <Button type="submit" className="w-full" loading={loading}>Vérifier</Button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleStep3} className="space-y-4">
          <p className="text-sm text-content-secondary text-center">
            Entrez votre nouveau numéro de téléphone. Un code de confirmation sera envoyé à votre adresse email <strong>{email}</strong>.
          </p>
          <Input
            label="Nouveau numéro"
            type="tel"
            value={tel}
            onChange={e => setTel(e.target.value)}
            placeholder="+225 07 00 00 00 00"
            required
          />
          <Button type="submit" className="w-full" loading={loading}>Continuer</Button>
        </form>
      )}

      {step === 4 && (
        <form onSubmit={handleStep4} className="space-y-4">
          <p className="text-sm text-content-secondary text-center">
            Un code a été envoyé à votre adresse email <strong>{email}</strong> pour confirmer le numéro <strong>{tel}</strong>.
          </p>
          <Input
            label="Code de confirmation"
            type="text"
            inputMode="numeric"
            value={otp2}
            onChange={e => setOtp2(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            required
            className="text-center tracking-widest font-mono"
          />
          <Button type="submit" className="w-full" loading={loading}>Vérifier</Button>
        </form>
      )}

      {step === 5 && (
        <form onSubmit={handleStep5} className="space-y-4">
          <Input
            label="Nouveau mot de passe"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Input
            label="Confirmer le mot de passe"
            type="password"
            value={confirmPwd}
            onChange={e => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" className="w-full" loading={loading}>Enregistrer</Button>
        </form>
      )}
    </AuthLayout>
  )
}
