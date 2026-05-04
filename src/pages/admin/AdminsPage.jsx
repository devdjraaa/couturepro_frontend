import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus, Trash2, Shield, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react'
import { AdminLayout } from '@/components/admin'
import { useAdmins, useCreateAdmin, useUpdateAdminPermissions, useRevokeAdmin } from '@/hooks/admin/useAdmins'
import { formatDate } from '@/utils/formatDate'

const ROLE_LABELS = { super_admin: 'Super Admin', admin: 'Admin', support: 'Support' }
const ROLE_COLORS = {
  super_admin: 'bg-indigo-100 text-indigo-700',
  admin:       'bg-blue-100 text-blue-700',
  support:     'bg-gray-100 text-gray-600',
}

const EMPTY_FORM = { nom: '', prenom: '', email: '', password: '', role: 'admin', permissions: [] }

function PermissionsList({ permissions, allPermissions, onChange, readonly }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3">
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
            className="w-3.5 h-3.5 accent-indigo-600"
          />
          <span className={readonly ? 'text-gray-400' : 'text-gray-700'}>{label}</span>
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
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-4 px-5 py-3 bg-white">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm">{admin.prenom} {admin.nom}</p>
          <p className="text-xs text-gray-400 truncate">{admin.email}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[admin.role]}`}>
          {ROLE_LABELS[admin.role]}
        </span>
        {!admin.is_active && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
            {t('admin.admins.inactif')}
          </span>
        )}
        <span className="text-xs text-gray-400 hidden sm:block">{formatDate(admin.created_at)}</span>
        {!isSuperAdmin && (
          <div className="flex items-center gap-2">
            <button onClick={() => setExpanded(x => !x)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            <button
              onClick={() => {
                if (confirm(t('admin.admins.revoquer_confirm', { nom: `${admin.prenom} ${admin.nom}` })))
                  onRevoke(admin.id)
              }}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {expanded && !isSuperAdmin && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <Shield size={12} /> {t('admin.admins.permissions_titre')}
          </p>
          <PermissionsList permissions={perms} allPermissions={allPermissions} onChange={setPerms} readonly={false} />
          <div className="flex items-center gap-3 mt-4">
            <button onClick={handleSave} disabled={update.isPending}
              className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-60">
              {update.isPending ? t('admin.admins.enregistrement') : t('admin.admins.enregistrer')}
            </button>
            {saved && <span className="text-xs text-green-600">{t('admin.admins.permissions_sauvees')}</span>}
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
        <p className="text-sm text-gray-500">{t('admin.admins.comptes', { count: admins.length })}</p>
        <button onClick={() => setShowForm(x => !x)}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
          <UserPlus size={14} /> {t('admin.admins.nouveau')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-4">
          <p className="font-semibold text-gray-800 text-sm">{t('admin.admins.creer_titre')}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('admin.admins.nom')}</label>
              <input value={form.nom} onChange={set('nom')} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                placeholder="Koné" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('admin.admins.prenom')}</label>
              <input value={form.prenom} onChange={set('prenom')} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                placeholder="Kadiatou" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('admin.admins.email')}</label>
            <input type="email" value={form.email} onChange={set('email')} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              placeholder="admin@couturepro.app" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('admin.admins.mdp')}</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password} onChange={set('password')} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:border-indigo-400"
                placeholder={t('admin.admins.mdp_placeholder')}
              />
              <button type="button" onClick={() => setShowPw(x => !x)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('admin.admins.role')}</label>
            <select value={form.role} onChange={set('role')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
              <option value="admin">Admin</option>
              <option value="support">Support</option>
            </select>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Shield size={11} /> {t('admin.admins.permissions_initiales')}</p>
            <PermissionsList
              permissions={form.permissions}
              allPermissions={allPermissions}
              onChange={perms => setForm(f => ({ ...f, permissions: perms }))}
              readonly={false}
            />
          </div>
          {apiError && <p className="text-sm text-red-500">{apiError}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setShowForm(false); setApiError('') }}
              className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50">
              {t('admin.admins.annuler')}
            </button>
            <button type="submit" disabled={createAdmin.isPending}
              className="flex-1 bg-indigo-600 text-white text-sm py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60">
              {createAdmin.isPending ? t('admin.admins.creation') : t('admin.admins.creer')}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : admins.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">{t('admin.admins.aucun')}</p>
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
