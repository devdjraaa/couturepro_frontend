import { useState } from 'react'
import { Plus, Edit2 } from 'lucide-react'
import { AdminLayout, AdminTable, AdminBadge } from '@/components/admin'
import { useAdminPlans, useCreatePlan, useUpdatePlan, useTogglePlan } from '@/hooks/admin/usePlans'

const EMPTY_FORM = { cle: '', label: '', duree_jours: '', prix_xof: '', description_courte: '', config: '{}' }

function PlanModal({ initial, onClose, onSubmit, isLoading }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM)
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))
  const isEdit = !!initial?.id

  const handleSubmit = e => {
    e.preventDefault()
    let config
    try { config = JSON.parse(form.config) } catch { config = {} }
    onSubmit({ ...form, config, duree_jours: Number(form.duree_jours), prix_xof: Number(form.prix_xof) })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h3 className="font-semibold text-gray-800 mb-4">{isEdit ? 'Modifier le plan' : 'Nouveau plan'}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          {!isEdit && (
            <div>
              <label className="text-xs text-gray-500">Clé (unique)</label>
              <input value={form.cle} onChange={set('cle')} required placeholder="ex: premium_mensuel"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400" />
            </div>
          )}
          <div>
            <label className="text-xs text-gray-500">Label</label>
            <input value={form.label} onChange={set('label')} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Durée (jours)</label>
              <input type="number" value={form.duree_jours} onChange={set('duree_jours')} required min="1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Prix XOF</label>
              <input type="number" value={form.prix_xof} onChange={set('prix_xof')} required min="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Description courte</label>
            <input value={form.description_courte} onChange={set('description_courte')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Config JSON</label>
            <textarea value={typeof form.config === 'object' ? JSON.stringify(form.config, null, 2) : form.config}
              onChange={set('config')} rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono mt-1 focus:outline-none focus:border-indigo-400" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Annuler</button>
            <button type="submit" disabled={isLoading}
              className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PlansPage() {
  const { data: plans = [], isLoading } = useAdminPlans()
  const create = useCreatePlan()
  const update = useUpdatePlan()
  const toggle = useTogglePlan()
  const [modal, setModal] = useState(null) // null | 'create' | plan object

  const columns = [
    { key: 'cle',       label: 'Clé' },
    { key: 'label',     label: 'Label' },
    { key: 'duree_jours', label: 'Durée' , render: r => `${r.duree_jours} j` },
    { key: 'prix_xof',  label: 'Prix',    render: r => `${r.prix_xof?.toLocaleString()} XOF` },
    { key: 'is_actif',  label: 'Statut',  render: r => <AdminBadge value={r.is_actif ? 'actif' : 'expire'} /> },
    { key: 'abonnements_count', label: 'Abonnés' },
    { key: 'actions',   label: '',
      render: r => (
        <div className="flex gap-3">
          <button onClick={() => setModal({ ...r, config: JSON.stringify(r.config ?? {}) })}
            className="text-indigo-500 hover:text-indigo-700"><Edit2 size={14} /></button>
          <button onClick={() => toggle.mutate(r.id)}
            className={`text-xs hover:underline ${r.is_actif ? 'text-red-500' : 'text-green-600'}`}>
            {r.is_actif ? 'Désactiver' : 'Activer'}
          </button>
        </div>
      )
    },
  ]

  const handleCreate = async data => { await create.mutateAsync(data); setModal(null) }
  const handleUpdate = async data => { await update.mutateAsync({ id: modal.id, ...data }); setModal(null) }

  return (
    <AdminLayout title="Plans d'abonnement">
      <div className="flex justify-end mb-4">
        <button onClick={() => setModal('create')}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
          <Plus size={14} /> Nouveau plan
        </button>
      </div>

      {isLoading ? <p className="text-sm text-gray-400">Chargement…</p> : (
        <AdminTable columns={columns} rows={plans} emptyLabel="Aucun plan" />
      )}

      {modal === 'create' && (
        <PlanModal onClose={() => setModal(null)} onSubmit={handleCreate} isLoading={create.isPending} />
      )}
      {modal && modal !== 'create' && (
        <PlanModal initial={modal} onClose={() => setModal(null)} onSubmit={handleUpdate} isLoading={update.isPending} />
      )}
    </AdminLayout>
  )
}
