import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { AdminLayout, ADMIN_INPUT, ADMIN_LABEL } from '@/components/admin'
import { notifAdminService } from '@/services/admin/notifAdminService'
import { useAdminAteliers } from '@/hooks/admin/useAteliers'

export default function AdminNotificationsPage() {
  const { t } = useTranslation()
  const { data: ateliers } = useAdminAteliers()
  const [form, setForm] = useState({ titre: '', contenu: '', type: 'info', atelier_id: '' })
  const [success, setSuccess] = useState('')

  const TYPES = [
    { value: 'info',              label: t('admin.notifications.types.info') },
    { value: 'promo',             label: t('admin.notifications.types.promo') },
    { value: 'mise_a_jour',       label: t('admin.notifications.types.mise_a_jour') },
    { value: 'alerte_sync',       label: t('admin.notifications.types.alerte_sync') },
    { value: 'alerte_abonnement', label: t('admin.notifications.types.alerte_abonnement') },
  ]

  const send = useMutation({
    mutationFn: () => notifAdminService.broadcast({
      titre:      form.titre,
      contenu:    form.contenu,
      type:       form.type,
      atelier_id: form.atelier_id || undefined,
    }),
    onSuccess: (data) => {
      setSuccess(data.message ?? t('admin.notifications.envoyer_atelier'))
      setForm({ titre: '', contenu: '', type: 'info', atelier_id: '' })
    },
  })

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))
  const ateliersList = ateliers?.data ?? ateliers ?? []

  const handleSubmit = e => { e.preventDefault(); setSuccess(''); send.mutate() }

  return (
    <AdminLayout title={t('admin.notifications.titre')}>
      <div className="max-w-lg">
        <p className="text-sm text-ghost mb-6">{t('admin.notifications.broadcast_desc')}</p>

        <form onSubmit={handleSubmit} className="bg-card border border-edge rounded-xl p-6 space-y-4">
          <div>
            <label className={ADMIN_LABEL}>{t('admin.notifications.atelier_cible')}</label>
            <select value={form.atelier_id} onChange={set('atelier_id')} className={ADMIN_INPUT}>
              <option value="">{t('admin.notifications.broadcast_tous')}</option>
              {ateliersList.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
            </select>
          </div>

          <div>
            <label className={ADMIN_LABEL}>{t('admin.notifications.type')}</label>
            <select value={form.type} onChange={set('type')} className={ADMIN_INPUT}>
              {TYPES.map(tp => <option key={tp.value} value={tp.value}>{tp.label}</option>)}
            </select>
          </div>

          <div>
            <label className={ADMIN_LABEL}>{t('admin.notifications.titre_label')}</label>
            <input value={form.titre} onChange={set('titre')} required maxLength={150} className={ADMIN_INPUT} />
          </div>

          <div>
            <label className={ADMIN_LABEL}>{t('admin.notifications.contenu')}</label>
            <textarea value={form.contenu} onChange={set('contenu')} required rows={4}
              className={`${ADMIN_INPUT} resize-none`} />
          </div>

          {send.isError && (
            <p className="text-sm text-danger">{send.error?.message ?? t('admin.notifications.erreur_envoi')}</p>
          )}
          {success && <p className="text-sm text-success">{success}</p>}

          <button type="submit" disabled={send.isPending}
            className="w-full bg-primary text-inverse font-medium py-2.5 rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors text-sm">
            {send.isPending
              ? t('admin.notifications.envoi')
              : form.atelier_id
                ? t('admin.notifications.envoyer_atelier')
                : t('admin.notifications.broadcaster')}
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
