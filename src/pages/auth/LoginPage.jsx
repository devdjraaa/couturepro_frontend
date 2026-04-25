import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts'
import { AuthLayout } from '@/components/layout'
import { Input, Button } from '@/components/ui'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ telephone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout subtitle="Connectez-vous à votre atelier">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Téléphone"
          type="tel"
          value={form.telephone}
          onChange={set('telephone')}
          placeholder="+225 07 00 00 00 00"
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
          Se connecter
        </Button>
        <p className="text-center text-sm text-dim">
          Pas encore inscrit ?{' '}
          <Link to="/register" className="text-primary font-medium">
            Créer un compte
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
