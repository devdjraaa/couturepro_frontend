import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminLayout, AdminTable, AdminBadge } from '@/components/admin'
import { useAdminSignalements, useTraiterSignalement } from '@/hooks/admin/useSignalements'
import { formatDate } from '@/utils/formatDate'

export default function SignalementsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminSignalements({ page, per_page: 30 })
  const rows        = data?.data         ?? data ?? []
  const currentPage = data?.current_page ?? 1
  const lastPage    = data?.last_page    ?? 1
  const traiter = useTraiterSignalement()

  const columns = [
    { key: 'type',       label: 'Type',   render: r => <AdminBadge value={r.type} /> },
    { key: 'cible_id',   label: 'Cible',  render: r => <span className="text-xs text-dim break-all">{r.cible_id}</span> },
    { key: 'motif',      label: 'Motif',  render: r => r.motif || '—' },
    { key: 'statut',     label: 'Statut', render: r => <AdminBadge value={r.statut} /> },
    { key: 'created_at', label: 'Date',   render: r => formatDate(r.created_at) },
    {
      key: 'actions', label: '',
      render: r => r.statut === 'en_attente'
        ? <button onClick={() => traiter.mutate(r.id)} className="text-xs font-medium text-primary hover:underline">Traiter</button>
        : <span className="text-xs text-ghost">✓</span>,
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
