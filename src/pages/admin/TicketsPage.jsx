import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout, AdminTable, AdminBadge } from '@/components/admin'
import { useAdminTickets } from '@/hooks/admin/useTickets'
import { formatDate } from '@/utils/formatDate'

const PRIORITE_COLORS = { haute: 'text-red-600', normale: 'text-yellow-600', basse: 'text-gray-400' }

export default function TicketsPage() {
  const navigate = useNavigate()
  const [statut,   setStatut]   = useState('')
  const [priorite, setPriorite] = useState('')

  const { data, isLoading } = useAdminTickets({ statut, priorite })
  const tickets = data?.data ?? []

  const columns = [
    { key: 'reference', label: 'Réf.',
      render: r => (
        <button onClick={() => navigate(`/admin/tickets/${r.id}`)} className="font-mono text-indigo-600 hover:underline text-sm">
          {r.reference}
        </button>
      )
    },
    { key: 'atelier',   label: 'Atelier',   render: r => r.atelier?.nom ?? '—' },
    { key: 'sujet',     label: 'Sujet',     render: r => <span className="text-sm line-clamp-1 max-w-xs">{r.sujet}</span> },
    { key: 'priorite',  label: 'Priorité',
      render: r => <span className={`text-sm font-medium ${PRIORITE_COLORS[r.priorite] ?? ''}`}>{r.priorite}</span>
    },
    { key: 'statut',    label: 'Statut',    render: r => <AdminBadge value={r.statut} /> },
    { key: 'assignedTo', label: 'Assigné à', render: r => r.assignedTo ? `${r.assignedTo.prenom} ${r.assignedTo.nom}` : '—' },
    { key: 'created_at', label: 'Créé le',  render: r => formatDate(r.created_at) },
  ]

  return (
    <AdminLayout title="Tickets support">
      <div className="flex gap-3 mb-5">
        <select value={statut} onChange={e => setStatut(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-400">
          <option value="">Tous statuts</option>
          <option value="ouvert">Ouvert</option>
          <option value="en_cours">En cours</option>
          <option value="ferme">Fermé</option>
        </select>
        <select value={priorite} onChange={e => setPriorite(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-400">
          <option value="">Toutes priorités</option>
          <option value="haute">Haute</option>
          <option value="normale">Normale</option>
          <option value="basse">Basse</option>
        </select>
      </div>

      {isLoading ? <p className="text-sm text-gray-400">Chargement…</p> : (
        <AdminTable columns={columns} rows={tickets} emptyLabel="Aucun ticket" />
      )}
    </AdminLayout>
  )
}
