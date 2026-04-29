import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts'
import { AuthLayout } from '@/components/layout'
import { Input, Button, LanguageSwitcher } from '@/components/ui'

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
  const { t } = useTranslation()
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
      setError(err?.response?.data?.message || t('erreurs.mot_de_passe_invalide'))
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
      setError(err?.response?.data?.message || t('erreurs.mot_de_passe_invalide'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout subtitle={t('auth.connexion.sous_titre_login')}>
      {/* Langue */}
      <div className="flex justify-end mb-4">
        <LanguageSwitcher variant="badge" />
      </div>

      {/* Onglets */}
      <div className="flex rounded-xl bg-surface border border-border p-1 mb-5 gap-1">
        {[
          { key: 'proprietaire', label: t('auth.connexion.onglet_proprietaire') },
          { key: 'equipe',       label: t('auth.connexion.onglet_equipe') },
        ].map(tab_ => (
          <button
            key={tab_.key}
            type="button"
            onClick={() => { setTab(tab_.key); setError('') }}
            className={`flex-1 text-sm py-2 rounded-lg font-medium transition-colors ${
              tab === tab_.key
                ? 'bg-primary text-white'
                : 'text-content-secondary hover:text-content'
            }`}
          >
            {tab_.label}
          </button>
        ))}
      </div>

      {tab === 'proprietaire' ? (
        <form onSubmit={handlePropLogin} className="space-y-4">
          <Input
            label={t('commun.telephone')}
            type="tel"
            value={propForm.telephone}
            onChange={setProp('telephone')}
            placeholder="+225 07 00 00 00 00"
            required
          />
          <Input
            label={t('auth.connexion.mot_de_passe')}
            type="password"
            value={propForm.password}
            onChange={setProp('password')}
            placeholder="••••••••"
            required
          />
          {error && <p className="text-sm text-danger text-center">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            {t('auth.connexion.se_connecter')}
          </Button>
          <div className="flex justify-between text-sm text-content-secondary">
            <Link to="/register" className="text-primary font-medium">{t('auth.connexion.creer_compte')}</Link>
            <Link to="/mot-de-passe-oublie" className="text-dim hover:text-ink">{t('auth.connexion.mot_de_passe_oublie')}</Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleEquipeLogin} className="space-y-4">
          <Input
            label={t('auth.connexion.code_acces')}
            value={equipeForm.code_acces}
            onChange={setEq('code_acces')}
            placeholder="ex : ABCD1234"
            required
            className="uppercase tracking-widest font-mono"
          />
          <Input
            label={t('auth.connexion.mot_de_passe')}
            type="password"
            value={equipeForm.password}
            onChange={setEq('password')}
            placeholder="••••••••"
            required
          />
          <p className="text-xs text-content-secondary text-center -mt-2">
            {t('auth.connexion.code_acces_hint')}
          </p>
          {error && <p className="text-sm text-danger text-center">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            {t('auth.connexion.acceder_atelier')}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
