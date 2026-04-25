import { useState } from 'react'
import { AdminLayout, AdminTable, AdminBadge } from '@/components/admin'
import { useAdminPaiements, useValiderPaiement, useRembourserPaiement } from '@/hooks/admin/useAdminPaiements'
import { formatDate } from '@/utils/formatDate'

export default function AdminPaiementsPage() {
  const [statut,   setStatut]   = useState('')
  const [provider, setProvider] = useState('')

  const { data, isLoading } = useAdminPaiements({ statut, provider })
  const valider     = useValiderPaiement()
  const rembourser  = useRembourserPaiement()

  const paiements = data?.data ?? []

  const columns = [
    { key: 'atelier',    label: 'Atelier',    render: r => r.atelier?.nom ?? r.atelier_id },
    { key: 'niveau_cle', label: 'Plan' },
    { key: 'montant',    label: 'Montant',    render: r => `${r.montant?.toLocaleString()} XOF` },
    { key: 'provider',   label: 'Provider' },
    { key: 'statut',     label: 'Statut',     render: r => <AdminBadge value={r.statut} /> },
    { key: 'created_at', label: 'Date',       render: r => formatDate(r.created_at) },
    { key: 'actions',    label: '',
      render: r => (
        <div className="flex gap-3">
          {(r.statut === 'pending' || r.statut === 'failed') && (
            <button onClick={() => valider.mutate(r.id)} className="text-xs text-green-600 hover:underline">
              Valider
            </button>
          )}
          {r.statut === 'completed' && (
            <button onClick={() => rembourser.mutate(r.id)} className="text-xs text-red-500 hover:underline">
              Rembourser
            </button>
          )}
        </div>
      )
    },
  ]

  return (
    <AdminLayout title="Paiements">
      <div className="flex gap-3 mb-5">
        <select value={statut} onChange={e => setStatut(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-400">
          <option value="">Tous statuts</option>
          <option value="pending">Pending</option>
          <option value="completed">Complété</option>
          <option value="failed">Échoué</option>
          <option value="refunded">Remboursé</option>
        </select>
        <select value={provider} onChange={e => setProvider(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-400">
          <option value="">Tous providers</option>
          <option value="orange_money">Orange Money</option>
          <option value="wave">Wave</option>
          <option value="mtn_momo">MTN MoMo</option>
        </select>
      </div>

      {isLoading ? <p className="text-sm text-gray-400">Chargement…</p> : (
        <AdminTable columns={columns} rows={paiements} emptyLabel="Aucun paiement" />
      )}
    </AdminLayout>
  )
}
