import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sun, Moon, Monitor, Lock, User, Check } from 'lucide-react'
import { AdminLayout, ADMIN_INPUT, ADMIN_LABEL } from '@/components/admin'
import { useAdminAuth } from '@/contexts'
import { useTheme } from '@/contexts'
import { adminAuthService } from '@/services/admin/adminAuthService'
import { cn } from '@/utils/cn'

function ThemeSection() {
  const { t } = useTranslation()
  const { theme, setTheme, resolvedTheme } = useTheme()

  const options = [
    { key: 'light',  label: t('admin.parametres.theme_clair'),   icon: Sun },
    { key: 'dark',   label: t('admin.parametres.theme_sombre'),  icon: Moon },
    { key: 'system', label: t('admin.parametres.theme_systeme'), icon: Monitor },
  ]

  return (
    <div className="bg-card border border-edge rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sun size={16} className="text-ghost" />
        <h3 className="text-sm font-semibold text-ink">{t('admin.parametres.apparence')}</h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {options.map(({ key, label, icon: Icon }) => {
          const active = theme === key
          return (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={cn(
                'flex flex-col items-center gap-2 py-3 px-2 rounded-lg border text-sm font-medium transition-colors',
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-edge text-ghost hover:border-edge-strong hover:text-dim',
              )}
            >
              <Icon size={18} />
              <span className="text-xs leading-tight text-center">{label}</span>
              {active && <Check size={12} className="text-primary" />}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-ghost mt-3">
        {t('admin.parametres.theme_actif')}{' '}
        <span className="font-medium text-dim">
          {resolvedTheme === 'dark' ? t('admin.parametres.theme_sombre') : t('admin.parametres.theme_clair')}
        </span>
      </p>
    </div>
  )
}

function ProfilSection({ admin }) {
  const { t } = useTranslation()
  const rows = [
    { label: t('admin.parametres.profil_nom'),               value: `${admin?.prenom ?? ''} ${admin?.nom ?? ''}`.trim() || '—' },
    { label: t('admin.parametres.profil_email'),             value: admin?.email ?? '—' },
    { label: t('admin.parametres.profil_role'),              value: admin?.role ?? '—' },
    { label: t('admin.parametres.profil_derniere_connexion'), value: admin?.derniere_connexion_at
        ? new Date(admin.derniere_connexion_at).toLocaleString('fr-FR')
        : '—' },
  ]

  return (
    <div className="bg-card border border-edge rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <User size={16} className="text-ghost" />
        <h3 className="text-sm font-semibold text-ink">{t('admin.parametres.profil')}</h3>
      </div>
      <div className="space-y-0">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex flex-wrap justify-between gap-x-2 py-2.5 border-b border-edge last:border-0">
            <span className="text-sm text-ghost">{label}</span>
            <span className="text-sm font-medium text-ink">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SecuriteSection() {
  const { t } = useTranslation()
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
      setError(t('admin.parametres.mdp_non_concordants'))
      return
    }
    if (form.nouveau.length < 8) {
      setError(t('admin.parametres.mdp_trop_court'))
      return
    }

    setLoading(true)
    try {
      await adminAuthService.changePassword({ ancien: form.ancien, nouveau: form.nouveau })
      setSuccess(true)
      setForm({ ancien: '', nouveau: '', confirmation: '' })
    } catch (err) {
      setError(err?.message || t('admin.parametres.erreur_changement'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-edge rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lock size={16} className="text-ghost" />
        <h3 className="text-sm font-semibold text-ink">{t('admin.parametres.securite')}</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={ADMIN_LABEL}>{t('admin.parametres.mdp_actuel')}</label>
          <input type="password" value={form.ancien} onChange={set('ancien')} required className={ADMIN_INPUT} placeholder="••••••••" />
        </div>
        <div>
          <label className={ADMIN_LABEL}>{t('admin.parametres.mdp_nouveau')}</label>
          <input type="password" value={form.nouveau} onChange={set('nouveau')} required className={ADMIN_INPUT} placeholder="••••••••" />
        </div>
        <div>
          <label className={ADMIN_LABEL}>{t('admin.parametres.mdp_confirmer')}</label>
          <input type="password" value={form.confirmation} onChange={set('confirmation')} required className={ADMIN_INPUT} placeholder="••••••••" />
        </div>

        {error   && <p className="text-sm text-danger">{error}</p>}
        {success && <p className="text-sm text-success">{t('admin.parametres.mdp_succes')}</p>}

        <button type="submit" disabled={loading}
          className="bg-primary hover:bg-primary-600 disabled:opacity-50 text-inverse text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          {loading ? t('admin.commun.enregistrement') : t('admin.parametres.mdp_modifier')}
        </button>
      </form>
    </div>
  )
}

export default function AdminParametresPage() {
  const { t } = useTranslation()
  const { admin } = useAdminAuth()

  return (
    <AdminLayout title={t('admin.parametres.titre')}>
      <div className="max-w-xl space-y-5">
        <ThemeSection />
        <ProfilSection admin={admin} />
        <SecuriteSection />
      </div>
    </AdminLayout>
  )
}
