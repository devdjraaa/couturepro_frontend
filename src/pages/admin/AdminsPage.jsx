import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus, Trash2, Shield, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react'
import { AdminLayout, AdminBadge, AtelierAvatar } from '@/components/admin'
import { useAdmins, useCreateAdmin, useUpdateAdminPermissions, useRevokeAdmin } from '@/hooks/admin/useAdmins'
import { formatDate } from '@/utils/formatDate'

const INPUT = 'w-full border border-edge rounded-xl px-3 py-2 text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'
const LABEL = 'block text-xs text-ghost mb-1'

const EMPTY_FORM = { nom: '', prenom: '', email: '', password: '', role: 'admin', permissions: [] }

function PermissionsList({ permissions, allPermissions, onChange, readonly }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 sm:gap-x-6 gap-y-1 mt-3">
      {Object.entries(allPermissions).map(([key, label]) => (
        <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            disabled={readonly}
            checked={permissions.includes(key)}
            onChange={e => {
              if (e.target.checked) onChange([...permissions, key])
              else onChange(permissions.filter(p => p !== key))
            }}
            className="w-3.5 h-3.5 accent-primary"
          />
          <span className={readonly ? 'text-ghost' : 'text-dim'}>{label}</span>
        </label>
      ))}
    </div>
  )
}

function AdminRow({ admin, allPermissions, onRevoke }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const [perms, setPerms] = useState(admin.permissions ?? [])
  const [saved, setSaved] = useState(false)
  const update = useUpdateAdminPermissions()
  const isSuperAdmin = admin.role === 'super_admin'

  const handleSave = async () => {
    setSaved(false)
    await update.mutateAsync({ id: admin.id, permissions: perms })
    setSaved(true)
  }

  return (
    <div className="border border-edge rounded-xl overflow-hidden">
      <div className="flex items-center gap-4 px-5 py-3 bg-card hover:bg-subtle transition-colors">
        <AtelierAvatar nom={`${admin.prenom} ${admin.nom}`} sub={admin.email} className="flex-1 min-w-0" />
        <AdminBadge value={admin.role} />
        {!admin.is_active && <AdminBadge value="inactif" />}
        <span className="text-xs text-ghost hidden sm:block">{formatDate(admin.created_at)}</span>
        {!isSuperAdmin && (
          <div className="flex items-center gap-2">
            <button onClick={() => setExpanded(x => !x)} className="p-1.5 text-ghost hover:text-primary transition-colors">
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            <button
              onClick={() => {
                if (confirm(t('admin.admins.revoquer_confirm', { nom: `${admin.prenom} ${admin.nom}` })))
                  onRevoke(admin.id)
              }}
              className="p-1.5 text-ghost hover:text-danger transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {expanded && !isSuperAdmin && (
        <div className="border-t border-edge px-5 py-4 bg-subtle">
          <p className="text-xs font-semibold text-ghost uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Shield size={12} /> {t('admin.admins.permissions_titre')}
          </p>
          <PermissionsList permissions={perms} allPermissions={allPermissions} onChange={setPerms} readonly={false} />
          <div className="flex items-center gap-3 mt-4">
            <button onClick={handleSave} disabled={update.isPending}
              className="text-sm bg-primary text-inverse px-4 py-1.5 rounded-xl hover:bg-primary-600 disabled:opacity-60 transition-colors">
              {update.isPending ? t('admin.admins.enregistrement') : t('admin.admins.enregistrer')}
            </button>
            {saved && <span className="text-xs text-success">{t('admin.admins.permissions_sauvees')}</span>}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useAdmins()
  const createAdmin = useCreateAdmin()
  const revokeAdmin = useRevokeAdmin()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [showPw, setShowPw] = useState(false)
  const [apiError, setApiError] = useState('')

  const admins         = data?.admins ?? []
  const allPermissions = data?.permissions ?? {}

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleCreate = async e => {
    e.preventDefault()
    setApiError('')
    try {
      await createAdmin.mutateAsync(form)
      setShowForm(false)
      setForm(EMPTY_FORM)
    } catch (err) {
      setApiError(err?.response?.data?.message ?? err?.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : t('admin.admins.erreur'))
    }
  }

  return (
    <AdminLayout title={t('admin.admins.titre')}>
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-ghost">{t('admin.admins.comptes', { count: admins.length })}</p>
        <button onClick={() => setShowForm(x => !x)}
          className="flex items-center gap-2 bg-primary text-inverse text-sm font-medium px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors">
          <UserPlus size={14} /> {t('admin.admins.nouveau')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card border border-edge rounded-xl p-5 mb-6 space-y-4">
          <p className="font-semibold text-ink text-sm">{t('admin.admins.creer_titre')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>{t('admin.admins.nom')}</label>
              <input value={form.nom} onChange={set('nom')} required placeholder="Koné" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>{t('admin.admins.prenom')}</label>
              <input value={form.prenom} onChange={set('prenom')} required placeholder="Kadiatou" className={INPUT} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t('admin.admins.email')}</label>
            <input type="email" value={form.email} onChange={set('email')} required placeholder="admin@gextimo.app" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>{t('admin.admins.mdp')}</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password} onChange={set('password')} required
                placeholder={t('admin.admins.mdp_placeholder')}
                className={INPUT}
              />
              <button type="button" onClick={() => setShowPw(x => !x)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ghost hover:text-dim transition-colors">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className={LABEL}>{t('admin.admins.role')}</label>
            <select value={form.role} onChange={set('role')} className={INPUT}>
              <option value="admin">Admin</option>
              <option value="support">Support</option>
            </select>
          </div>
          <div>
            <p className="text-xs text-ghost mb-1 flex items-center gap-1">
              <Shield size={11} /> {t('admin.admins.permissions_initiales')}
            </p>
            <PermissionsList
              permissions={form.permissions}
              allPermissions={allPermissions}
              onChange={perms => setForm(f => ({ ...f, permissions: perms }))}
              readonly={false}
            />
          </div>
          {apiError && <p className="text-sm text-danger">{apiError}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setShowForm(false); setApiError('') }}
              className="flex-1 border border-edge text-dim text-sm py-2 rounded-xl hover:bg-subtle transition-colors">
              {t('admin.admins.annuler')}
            </button>
            <button type="submit" disabled={createAdmin.isPending}
              className="flex-1 bg-primary text-inverse text-sm py-2 rounded-xl hover:bg-primary-600 disabled:opacity-60 transition-colors">
              {createAdmin.isPending ? t('admin.admins.creation') : t('admin.admins.creer')}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 bg-subtle rounded-xl animate-pulse" />
          ))}
        </div>
      ) : admins.length === 0 ? (
        <p className="text-sm text-ghost text-center py-10">{t('admin.admins.aucun')}</p>
      ) : (
        <div className="space-y-2">
          {admins.map(admin => (
            <AdminRow
              key={admin.id}
              admin={admin}
              allPermissions={allPermissions}
              onRevoke={id => revokeAdmin.mutate(id)}
            />
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
