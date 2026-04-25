import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AdminLayout, AdminTable, AdminBadge } from '@/components/admin'
import { useAdminTransactions, useCreateTransaction, useCancelTransaction } from '@/hooks/admin/useTransactions'
import { useAdminAteliers } from '@/hooks/admin/useAteliers'
import { useAdminPlans } from '@/hooks/admin/usePlans'
import { formatDate } from '@/utils/formatDate'

export default function TransactionsPage() {
  const { data, isLoading } = useAdminTransactions()
  const { data: ateliers = [] } = useAdminAteliers()
  const { data: plans = [] }    = useAdminPlans()
  const create = useCreateTransaction()
  const cancel = useCancelTransaction()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ atelier_id: '', niveau_cle: '' })

  const transactions = data?.data ?? []

  const columns = [
    { key: 'code_transaction', label: 'Code' },
    { key: 'atelier',    label: 'Atelier',    render: r => r.atelier?.nom ?? r.atelier_id },
    { key: 'niveau_cle', label: 'Plan' },
    { key: 'montant',    label: 'Montant',    render: r => `${r.montant?.toLocaleString()} XOF` },
    { key: 'statut',     label: 'Statut',     render: r => <AdminBadge value={r.statut} /> },
    { key: 'canal',      label: 'Canal' },
    { key: 'created_at', label: 'Créé le',    render: r => formatDate(r.created_at) },
    { key: 'actions',    label: '',
      render: r => r.statut === 'disponible' ? (
        <button onClick={() => cancel.mutate(r.id)} className="text-xs text-red-500 hover:underline">
          Annuler
        </button>
      ) : null
    },
  ]

  const handleCreate = async e => {
    e.preventDefault()
    await create.mutateAsync(form)
    setShowModal(false)
    setForm({ atelier_id: '', niveau_cle: '' })
  }

  const ateliersList = ateliers?.data ?? ateliers

  return (
    <AdminLayout title="Transactions (codes manuels)">
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
          <Plus size={14} /> Générer un code
        </button>
      </div>

      {isLoading ? <p className="text-sm text-gray-400">Chargement…</p> : (
        <AdminTable columns={columns} rows={transactions} emptyLabel="Aucune transaction" />
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Générer un code d'accès</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Atelier</label>
                <select value={form.atelier_id} onChange={e => setForm(f => ({ ...f, atelier_id: e.target.value }))} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400">
                  <option value="">Sélectionner…</option>
                  {ateliersList.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Plan</label>
                <select value={form.niveau_cle} onChange={e => setForm(f => ({ ...f, niveau_cle: e.target.value }))} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400">
                  <option value="">Sélectionner…</option>
                  {plans.map(p => <option key={p.id} value={p.cle}>{p.label}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="text-sm text-gray-500">Annuler</button>
                <button type="submit" disabled={create.isPending}
                  className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  {create.isPending ? 'Génération…' : 'Générer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
