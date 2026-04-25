import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts'
import { AuthLayout } from '@/components/layout'
import { Input, Button } from '@/components/ui'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, verifyOtp, resendOtp } = useAuth()
  const [step, setStep] = useState('form') // 'form' | 'otp'
  const [form, setForm] = useState({ nom: '', telephone: '', nom_atelier: '', password: '' })
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleRegister = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      setStep('otp')
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription")
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
      setError(err.message || 'Code invalide')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'otp') {
    return (
      <AuthLayout subtitle={`Code envoyé au ${form.telephone}`}>
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <Input
            label="Code de vérification"
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
            Vérifier
          </Button>
          <button
            type="button"
            onClick={() => resendOtp(form.telephone)}
            className="w-full text-sm text-dim underline py-2"
          >
            Renvoyer le code
          </button>
        </form>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout subtitle="Créez votre atelier en ligne">
      <form onSubmit={handleRegister} className="space-y-4">
        <Input
          label="Votre nom"
          value={form.nom}
          onChange={set('nom')}
          placeholder="Aminata Diallo"
          required
        />
        <Input
          label="Téléphone"
          type="tel"
          value={form.telephone}
          onChange={set('telephone')}
          placeholder="+225 07 00 00 00 00"
          required
        />
        <Input
          label="Nom de l'atelier"
          value={form.nom_atelier}
          onChange={set('nom_atelier')}
          placeholder="Atelier Aminata"
          required
        />
        <Input
          label="Mot de passe"
          type="password"
          value={form.password}
          onChange={set('password')}
          placeholder="••••••••"
          required
        />
        {error && <p className="text-sm text-danger text-center">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>
          Créer mon compte
        </Button>
        <p className="text-center text-sm text-dim">
          Déjà inscrit ?{' '}
          <Link to="/login" className="text-primary font-medium">
            Se connecter
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
