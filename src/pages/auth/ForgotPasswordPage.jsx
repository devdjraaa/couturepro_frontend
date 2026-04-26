import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'
import { AuthLayout } from '@/components/layout'
import { Input, Button } from '@/components/ui'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail]   = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { demande_id } = await authService.recuperationEtape1({ email })
      navigate('/recuperer-compte', { state: { email, demande_id } })
    } catch (err) {
      setError(err?.message || 'Aucun compte associé à cet email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout subtitle="Récupérer votre compte">
      <p className="text-sm text-content-secondary text-center mb-4">
        Entrez votre adresse email. Vous recevrez un code de vérification.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="aminata@atelier.com"
          required
        />
        {error && <p className="text-sm text-danger text-center">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>
          Envoyer le code
        </Button>
        <p className="text-center text-sm text-content-secondary">
          <Link to="/login" className="text-primary font-medium">Retour à la connexion</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
