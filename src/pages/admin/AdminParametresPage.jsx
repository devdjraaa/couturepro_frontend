import { useState } from 'react'
import { Sun, Moon, Monitor, Lock, User, Check } from 'lucide-react'
import { AdminLayout } from '@/components/admin'
import { useAdminAuth } from '@/contexts'
import { useTheme } from '@/contexts'
import { adminAuthService } from '@/services/admin/adminAuthService'

function ThemeSection() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const options = [
    { key: 'light',  label: 'Clair',   icon: Sun },
    { key: 'dark',   label: 'Sombre',  icon: Moon },
    { key: 'system', label: 'Système', icon: Monitor },
  ]

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sun size={16} className="text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Apparence</h3>
      </div>
      <div className="flex gap-3">
        {options.map(({ key, label, icon: Icon }) => {
          const active = theme === key
          return (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-lg border text-sm font-medium transition-colors ${
                active
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <Icon size={18} />
              {label}
              {active && <Check size={12} className="text-indigo-500" />}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
        Thème actif : <span className="font-medium">{resolvedTheme === 'dark' ? 'Sombre' : 'Clair'}</span>
      </p>
    </div>
  )
}

function ProfilSection({ admin }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <User size={16} className="text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Profil</h3>
      </div>
      <div className="space-y-2">
        {[
          { label: 'Nom',   value: `${admin?.prenom ?? ''} ${admin?.nom ?? ''}`.trim() || '—' },
          { label: 'Email', value: admin?.email ?? '—' },
          { label: 'Rôle',  value: admin?.role ?? '—' },
          { label: 'Dernière connexion', value: admin?.derniere_connexion_at
            ? new Date(admin.derniere_connexion_at).toLocaleString('fr-FR')
            : '—'
          },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SecuriteSection() {
  const [form, setForm]       = useState({ ancien: '', nouveau: '', confirmation: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (form.nouveau !== form.confirmation) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (form.nouveau.length < 8) {
      setError('Le nouveau mot de passe doit faire au moins 8 caractères.')
      return
    }

    setLoading(true)
    try {
      await adminAuthService.changePassword({ ancien: form.ancien, nouveau: form.nouveau })
      setSuccess(true)
      setForm({ ancien: '', nouveau: '', confirmation: '' })
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors du changement.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-400'
  const labelCls = 'block text-xs text-gray-500 dark:text-gray-400 mb-1'

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lock size={16} className="text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Sécurité — Changer le mot de passe</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelCls}>Mot de passe actuel</label>
          <input type="password" value={form.ancien} onChange={set('ancien')} required className={inputCls} placeholder="••••••••" />
        </div>
        <div>
          <label className={labelCls}>Nouveau mot de passe</label>
          <input type="password" value={form.nouveau} onChange={set('nouveau')} required className={inputCls} placeholder="••••••••" />
        </div>
        <div>
          <label className={labelCls}>Confirmer le nouveau mot de passe</label>
          <input type="password" value={form.confirmation} onChange={set('confirmation')} required className={inputCls} placeholder="••••••••" />
        </div>

        {error   && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600 dark:text-green-400">Mot de passe modifié avec succès.</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? 'Enregistrement…' : 'Modifier le mot de passe'}
        </button>
      </form>
    </div>
  )
}

export default function AdminParametresPage() {
  const { admin } = useAdminAuth()

  return (
    <AdminLayout title="Paramètres">
      <div className="max-w-xl space-y-5">
        <ThemeSection />
        <ProfilSection admin={admin} />
        <SecuriteSection />
      </div>
    </AdminLayout>
  )
}
