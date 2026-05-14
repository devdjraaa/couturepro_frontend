import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { useAdminAuth } from '@/contexts'

export default function AdminLoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAdminAuth()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || t('admin.login.identifiants_incorrects'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-primary font-bold text-xl uppercase tracking-widest">CouturePro</p>
          <p className="text-ghost text-sm mt-1">{t('admin.login.espace_admin')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-edge rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">{t('admin.parametres.profil_email')}</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="admin@couturepro.com"
              required
              className="w-full bg-subtle border border-edge rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ghost focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">{t('admin.login.mot_de_passe')}</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                required
                className="w-full bg-subtle border border-edge rounded-xl px-3 py-2.5 pr-10 text-sm text-ink placeholder:text-ghost focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPwd(v => !v)}
                aria-label={showPwd ? 'Masquer' : 'Voir'}
                className="absolute inset-y-0 right-3 flex items-center text-ghost hover:text-ink transition-colors"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-danger text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-inverse font-medium rounded-xl py-2.5 text-sm transition-colors"
          >
            {loading ? t('admin.login.connexion') : t('admin.login.se_connecter')}
          </button>
        </form>
      </div>
    </div>
  )
}
