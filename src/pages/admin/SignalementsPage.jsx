import { useState } from 'react'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AdminLayout, AdminTable, AdminBadge } from '@/components/admin'
import { useAdminSignalements, useTraiterSignalement, useSanctionnerSignalement } from '@/hooks/admin/useSignalements'
import { formatDate } from '@/utils/formatDate'

export default function SignalementsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminSignalements({ page, per_page: 30 })
  const rows        = data?.data         ?? data ?? []
  const currentPage = data?.current_page ?? 1
  const lastPage    = data?.last_page    ?? 1
  const traiter    = useTraiterSignalement()
  const sanctionner = useSanctionnerSignalement()

  const columns = [
    { key: 'type',       label: 'Type',   render: r => <AdminBadge value={r.type} /> },
    { key: 'cible_id',   label: 'Cible',  render: r => <span className="text-xs text-dim break-all">{r.cible_id}</span> },
    { key: 'motif',      label: 'Motif',  render: r => r.motif || '—' },
    { key: 'statut',     label: 'Statut', render: r => <AdminBadge value={r.statut} /> },
    { key: 'created_at', label: 'Date',   render: r => formatDate(r.created_at) },
    {
      key: 'actions', label: '',
      render: (r) => {
        if (r.statut !== 'en_attente') return <Check size={13} className="text-ghost" aria-hidden="true" />

        // La sanction automatique au 3ᵉ signalement a été retirée : elle
        // permettait de geler la boutique d'un créateur avec trois requêtes
        // anonymes. C'est donc ICI que l'arbitrage se fait — encore fallait-il
        // que l'écran le propose, ce qu'il ne faisait pas.
        const sanction = { profil: 'Geler l’atelier', avis: 'Masquer l’avis' }[r.type]

        return (
          <div className="flex items-center gap-3 justify-end">
            {sanction && (
              <button
                onClick={() => sanctionner.mutate({ id: r.id, type: r.type, cibleId: r.cible_id })}
                disabled={sanctionner.isPending}
                className="text-xs font-semibold text-danger hover:underline disabled:opacity-50"
              >
                {sanction}
              </button>
            )}
            <button onClick={() => traiter.mutate(r.id)} className="text-xs font-medium text-primary hover:underline">
              Classer sans suite
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <AdminLayout title="Signalements">
      {isLoading
        ? <p className="text-sm text-ghost">{t('admin.commun.chargement')}</p>
        : <AdminTable columns={columns} rows={rows} emptyLabel="Aucun signalement" currentPage={currentPage} lastPage={lastPage} onPage={setPage} />}
    </AdminLayout>
  )
}
