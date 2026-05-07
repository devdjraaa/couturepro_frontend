import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { AdminLayout, AdminTable, AdminBadge } from '@/components/admin'
import { useAdminOffres, useCreateOffre, useUpdateOffre, useDeleteOffre } from '@/hooks/admin/useOffres'
import { useAdminAteliers } from '@/hooks/admin/useAteliers'
import { useAdminPlans } from '@/hooks/admin/usePlans'
import { formatDate } from '@/utils/formatDate'

const EMPTY = { atelier_id: '', label: '', niveau_base_cle: '', config_override: '{}', prix_special: '', duree_jours: '', expire_at: '', notes_internes: '' }

const INPUT = 'w-full border border-edge rounded-xl px-3 py-2 text-sm text-ink bg-card mt-1 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'
const LABEL = 'text-xs text-ghost'

function OffreModal({ initial, onClose, onSubmit, isLoading, ateliers, plans }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(initial ?? EMPTY)
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))
  const isEdit = !!initial?.id

  const handleSubmit = e => {
    e.preventDefault()
    let config
    try { config = JSON.parse(form.config_override) } catch { config = {} }
    onSubmit({ ...form, config_override: config, duree_jours: Number(form.duree_jours), prix_special: form.prix_special ? Number(form.prix_special) : null })
  }

  const ateliersList = ateliers?.data ?? ateliers ?? []

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-xl">
        <h3 className="font-semibold text-ink mb-4">
          {isEdit ? t('admin.offres.modifier_titre') : t('admin.offres.nouvelle_titre')}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={LABEL}>{t('admin.offres.col_atelier')}</label>
            <select value={form.atelier_id} onChange={set('atelier_id')} required className={INPUT}>
              <option value="">{t('admin.commun.selectionner')}</option>
              {ateliersList.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL}>{t('admin.offres.col_label')}</label>
            <input value={form.label} onChange={set('label')} required className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>{t('admin.offres.plan_base')}</label>
            <select value={form.niveau_base_cle} onChange={set('niveau_base_cle')} required className={INPUT}>
              <option value="">{t('admin.commun.selectionner')}</option>
              {(plans ?? []).map(p => <option key={p.id} value={p.cle}>{p.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>{t('admin.offres.prix_special')}</label>
              <input type="number" value={form.prix_special} onChange={set('prix_special')} min="0" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>{t('admin.offres.duree')}</label>
              <input type="number" value={form.duree_jours} onChange={set('duree_jours')} required min="1" className={INPUT} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t('admin.offres.expire_le')}</label>
            <input type="date" value={form.expire_at} onChange={set('expire_at')} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>{t('admin.offres.config_override')}</label>
            <textarea
              value={typeof form.config_override === 'object' ? JSON.stringify(form.config_override, null, 2) : form.config_override}
              onChange={set('config_override')}
              rows={2}
              className={`${INPUT} font-mono`}
            />
          </div>
          <div>
            <label className={LABEL}>{t('admin.offres.notes_internes')}</label>
            <textarea value={form.notes_internes} onChange={set('notes_internes')} rows={2} className={INPUT} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="text-sm text-ghost hover:text-dim transition-colors">
              {t('admin.commun.annuler')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-inverse text-sm font-medium px-4 py-2 rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? t('admin.commun.enregistrement') : t('admin.plans.enregistrer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function OffresPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminOffres()
  const { data: ateliers }  = useAdminAteliers()
  const { data: plans }     = useAdminPlans()
  const create = useCreateOffre()
  const update = useUpdateOffre()
  const del    = useDeleteOffre()
  const [modal, setModal] = useState(null)

  const offres = data?.data ?? []

  const columns = [
    { key: 'label',           label: t('admin.offres.col_label') },
    { key: 'atelier',         label: t('admin.offres.col_atelier'),    render: r => r.atelier?.nom ?? r.atelier_id },
    { key: 'niveau_base_cle', label: t('admin.offres.col_plan_base') },
    {
      key: 'prix_special',
      label: t('admin.offres.col_prix'),
      render: r => r.prix_special ? (
        <span className="font-semibold text-ink tabular-nums">
          {r.prix_special.toLocaleString()} <span className="text-ghost font-normal text-xs">XOF</span>
        </span>
      ) : '—',
    },
    { key: 'duree_jours', label: t('admin.offres.col_duree'),  render: r => `${r.duree_jours} j` },
    { key: 'statut',      label: t('admin.offres.col_statut'), render: r => <AdminBadge value={r.statut} /> },
    {
      key: 'expire_at',
      label: t('admin.offres.col_expire'),
      render: r => r.expire_at ? (
        <span className="text-ghost text-xs whitespace-nowrap">{formatDate(r.expire_at)}</span>
      ) : '—',
    },
    {
      key: 'actions',
      label: '',
      render: r => (
        <div className="flex gap-2">
          <button
            onClick={() => setModal({ ...r, config_override: JSON.stringify(r.config_override ?? {}) })}
            className="text-ghost hover:text-primary transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => { if (confirm(t('admin.offres.supprimer_confirm'))) del.mutate(r.id) }}
            className="text-ghost hover:text-danger transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  const handleCreate = async data => { await create.mutateAsync(data); setModal(null) }
  const handleUpdate = async data => { await update.mutateAsync({ id: modal.id, ...data }); setModal(null) }

  return (
    <AdminLayout title={t('admin.offres.titre')}>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 bg-primary text-inverse text-sm font-medium px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors"
        >
          <Plus size={14} /> {t('admin.offres.nouvelle')}
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-ghost">{t('admin.commun.chargement')}</p>
      ) : (
        <AdminTable columns={columns} rows={offres} emptyLabel={t('admin.offres.aucune')} />
      )}

      {modal === 'create' && (
        <OffreModal ateliers={ateliers} plans={plans} onClose={() => setModal(null)} onSubmit={handleCreate} isLoading={create.isPending} />
      )}
      {modal && modal !== 'create' && (
        <OffreModal initial={modal} ateliers={ateliers} plans={plans} onClose={() => setModal(null)} onSubmit={handleUpdate} isLoading={update.isPending} />
      )}
    </AdminLayout>
  )
}
