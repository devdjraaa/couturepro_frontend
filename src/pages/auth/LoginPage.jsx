import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts'
import { AuthLayout } from '@/components/layout'
import { Input, Button } from '@/components/ui'

function getOrCreateDeviceId() {
  const key = 'cp_device_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, equipeLogin } = useAuth()
  const [tab, setTab]     = useState('proprietaire') // 'proprietaire' | 'equipe'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Formulaire propriétaire
  const [propForm, setPropForm] = useState({ telephone: '', password: '' })
  const setProp = key => e => setPropForm(f => ({ ...f, [key]: e.target.value }))

  // Formulaire membre
  const [equipeForm, setEquipeForm] = useState({ code_acces: '', password: '' })
  const setEq = key => e => setEquipeForm(f => ({ ...f, [key]: e.target.value }))

  const handlePropLogin = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(propForm)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || 'Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  const handleEquipeLogin = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await equipeLogin({
        code_acces: equipeForm.code_acces.trim().toUpperCase(),
        password:   equipeForm.password,
        device_id:  getOrCreateDeviceId(),
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || 'Code d\'accès ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout subtitle="Connectez-vous à votre atelier">
      {/* Onglets */}
      <div className="flex rounded-xl bg-surface border border-border p-1 mb-5 gap-1">
        {[
          { key: 'proprietaire', label: 'Propriétaire' },
          { key: 'equipe',       label: 'Assistant / Membre' },
        ].map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => { setTab(t.key); setError('') }}
            className={`flex-1 text-sm py-2 rounded-lg font-medium transition-colors ${
              tab === t.key
                ? 'bg-primary text-white'
                : 'text-content-secondary hover:text-content'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'proprietaire' ? (
        <form onSubmit={handlePropLogin} className="space-y-4">
          <Input
            label="Téléphone"
            type="tel"
            value={propForm.telephone}
            onChange={setProp('telephone')}
            placeholder="+225 07 00 00 00 00"
            required
          />
          <Input
            label="Mot de passe"
            type="password"
            value={propForm.password}
            onChange={setProp('password')}
            placeholder="••••••••"
            required
          />
          {error && <p className="text-sm text-danger text-center">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            Se connecter
          </Button>
          <p className="text-center text-sm text-content-secondary">
            Pas encore inscrit ?{' '}
            <Link to="/register" className="text-primary font-medium">Créer un compte</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleEquipeLogin} className="space-y-4">
          <Input
            label="Code d'accès"
            value={equipeForm.code_acces}
            onChange={setEq('code_acces')}
            placeholder="ex : ABCD1234"
            required
            className="uppercase tracking-widest font-mono"
          />
          <Input
            label="Mot de passe"
            type="password"
            value={equipeForm.password}
            onChange={setEq('password')}
            placeholder="••••••••"
            required
          />
          <p className="text-xs text-content-secondary text-center -mt-2">
            Le mot de passe initial est identique au code d'accès
          </p>
          {error && <p className="text-sm text-danger text-center">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            Accéder à l'atelier
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
