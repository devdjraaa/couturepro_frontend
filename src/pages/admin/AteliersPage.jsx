import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { AdminLayout, AdminTable, AdminBadge } from '@/components/admin'
import { useAdminAteliers, useGelerAtelier, useDegelerAtelier } from '@/hooks/admin/useAteliers'
import { formatDate } from '@/utils/formatDate'

export default function AteliersPage() {
  const navigate = useNavigate()
  const [search, setSearch]   = useState('')
  const [statut, setStatut]   = useState('')

  const { data, isLoading } = useAdminAteliers({ search, statut })
  const geler    = useGelerAtelier()
  const degeler  = useDegelerAtelier()

  const ateliers = data?.data ?? []

  const columns = [
    { key: 'nom',         label: 'Atelier',
      render: r => (
        <button onClick={() => navigate(`/admin/ateliers/${r.id}`)} className="font-medium text-indigo-600 hover:underline text-left">
          {r.nom}
        </button>
      )
    },
    { key: 'proprietaire', label: 'Propriétaire',
      render: r => r.proprietaire ? `${r.proprietaire.prenom} ${r.proprietaire.nom}` : '—'
    },
    { key: 'statut',      label: 'Statut',      render: r => <AdminBadge value={r.statut} /> },
    { key: 'clients_count',   label: 'Clients' },
    { key: 'commandes_count', label: 'Commandes' },
    { key: 'created_at',  label: 'Créé le',     render: r => formatDate(r.created_at) },
    { key: 'actions',     label: '',
      render: r => (
        <div className="flex gap-2">
          {r.statut === 'gele' ? (
            <button
              onClick={() => degeler.mutate(r.id)}
              className="text-xs text-green-600 hover:underline"
            >
              Dégeler
            </button>
          ) : (
            <button
              onClick={() => geler.mutate(r.id)}
              className="text-xs text-red-500 hover:underline"
            >
              Geler
            </button>
          )}
        </div>
      )
    },
  ]

  return (
    <AdminLayout title="Ateliers">
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Chercher un atelier…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
          />
        </div>
        <select
          value={statut}
          onChange={e => setStatut(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-400"
        >
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="expire">Expiré</option>
          <option value="gele">Gelé</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Chargement…</p>
      ) : (
        <>
          <AdminTable columns={columns} rows={ateliers} emptyLabel="Aucun atelier trouvé" />
          {data?.last_page > 1 && (
            <p className="text-xs text-gray-400 mt-3 text-right">
              Page {data.current_page} / {data.last_page} — {data.total} ateliers
            </p>
          )}
        </>
      )}
    </AdminLayout>
  )
}
