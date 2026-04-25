import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts'
import { AuthLayout } from '@/components/layout'
import { Input, Button, Select } from '@/components/ui'

const QUESTIONS_SECRETE = [
  { value: 'Quel est le nom de votre premier animal de compagnie ?', label: 'Nom de votre premier animal de compagnie ?' },
  { value: 'Quel est le prénom de votre meilleure amie d\'enfance ?', label: 'Prénom de votre meilleure amie d\'enfance ?' },
  { value: 'Quelle est la ville où vous êtes né(e) ?', label: 'Ville de naissance ?' },
  { value: 'Quel est le nom de votre école primaire ?', label: 'Nom de votre école primaire ?' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, verifyOtp, resendOtp } = useAuth()
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
      setError('Les mots de passe ne correspondent pas')
      return
    }
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
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Prénom"
            value={form.prenom}
            onChange={set('prenom')}
            placeholder="Aminata"
            required
          />
          <Input
            label="Nom"
            value={form.nom}
            onChange={set('nom')}
            placeholder="Diallo"
            required
          />
        </div>
        <Input
          label="Téléphone"
          type="tel"
          value={form.telephone}
          onChange={set('telephone')}
          placeholder="+225 07 00 00 00 00"
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="aminata@atelier.com"
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
        <Input
          label="Confirmer le mot de passe"
          type="password"
          value={form.password_confirmation}
          onChange={set('password_confirmation')}
          placeholder="••••••••"
          required
        />
        <Select
          label="Question secrète"
          value={form.question_secrete}
          onChange={set('question_secrete')}
          options={QUESTIONS_SECRETE}
          required
        />
        <Input
          label="Réponse secrète"
          value={form.reponse_secrete}
          onChange={set('reponse_secrete')}
          placeholder="Votre réponse"
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
