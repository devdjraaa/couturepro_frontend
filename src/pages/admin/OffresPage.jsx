import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { AdminLayout, AdminTable, AdminBadge } from '@/components/admin'
import { useAdminOffres, useCreateOffre, useUpdateOffre, useDeleteOffre } from '@/hooks/admin/useOffres'
import { useAdminAteliers } from '@/hooks/admin/useAteliers'
import { useAdminPlans } from '@/hooks/admin/usePlans'
import { formatDate } from '@/utils/formatDate'

const EMPTY = { atelier_id: '', label: '', niveau_base_cle: '', config_override: '{}', prix_special: '', duree_jours: '', expire_at: '', notes_internes: '' }

function OffreModal({ initial, onClose, onSubmit, isLoading, ateliers, plans }) {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="font-semibold text-gray-800 mb-4">{isEdit ? 'Modifier l\'offre' : 'Nouvelle offre spéciale'}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Atelier</label>
            <select value={form.atelier_id} onChange={set('atelier_id')} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400">
              <option value="">Sélectionner…</option>
              {ateliersList.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Label</label>
            <input value={form.label} onChange={set('label')} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Plan de base</label>
            <select value={form.niveau_base_cle} onChange={set('niveau_base_cle')} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400">
              <option value="">Sélectionner…</option>
              {(plans ?? []).map(p => <option key={p.id} value={p.cle}>{p.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Prix spécial XOF</label>
              <input type="number" value={form.prix_special} onChange={set('prix_special')} min="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Durée (jours)</label>
              <input type="number" value={form.duree_jours} onChange={set('duree_jours')} required min="1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Expire le</label>
            <input type="date" value={form.expire_at} onChange={set('expire_at')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Config JSON override</label>
            <textarea value={typeof form.config_override === 'object' ? JSON.stringify(form.config_override, null, 2) : form.config_override}
              onChange={set('config_override')} rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono mt-1 focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Notes internes</label>
            <textarea value={form.notes_internes} onChange={set('notes_internes')} rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="text-sm text-gray-500">Annuler</button>
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

export default function OffresPage() {
  const { data, isLoading } = useAdminOffres()
  const { data: ateliers }  = useAdminAteliers()
  const { data: plans }     = useAdminPlans()
  const create = useCreateOffre()
  const update = useUpdateOffre()
  const del    = useDeleteOffre()
  const [modal, setModal] = useState(null)

  const offres = data?.data ?? []

  const columns = [
    { key: 'label',         label: 'Label' },
    { key: 'atelier',       label: 'Atelier',   render: r => r.atelier?.nom ?? r.atelier_id },
    { key: 'niveau_base_cle', label: 'Plan base' },
    { key: 'prix_special',  label: 'Prix',       render: r => r.prix_special ? `${r.prix_special?.toLocaleString()} XOF` : '—' },
    { key: 'duree_jours',   label: 'Durée',      render: r => `${r.duree_jours} j` },
    { key: 'statut',        label: 'Statut',     render: r => <AdminBadge value={r.statut} /> },
    { key: 'expire_at',     label: 'Expire',     render: r => r.expire_at ? formatDate(r.expire_at) : '—' },
    { key: 'actions',       label: '',
      render: r => (
        <div className="flex gap-2">
          <button onClick={() => setModal({ ...r, config_override: JSON.stringify(r.config_override ?? {}) })}
            className="text-indigo-500 hover:text-indigo-700"><Edit2 size={14} /></button>
          <button onClick={() => { if (confirm('Supprimer cette offre ?')) del.mutate(r.id) }}
            className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
        </div>
      )
    },
  ]

  const handleCreate = async data => { await create.mutateAsync(data); setModal(null) }
  const handleUpdate = async data => { await update.mutateAsync({ id: modal.id, ...data }); setModal(null) }

  return (
    <AdminLayout title="Offres spéciales">
      <div className="flex justify-end mb-4">
        <button onClick={() => setModal('create')}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
          <Plus size={14} /> Nouvelle offre
        </button>
      </div>

      {isLoading ? <p className="text-sm text-gray-400">Chargement…</p> : (
        <AdminTable columns={columns} rows={offres} emptyLabel="Aucune offre" />
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
