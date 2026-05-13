import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminLayout, AdminTable } from '@/components/admin'
import { useAuditLogs } from '@/hooks/admin/useAudit'
import { formatDate } from '@/utils/formatDate'

export default function AuditPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useAuditLogs({ page, per_page: 15 })
  const logs        = data?.data         ?? []
  const currentPage = data?.current_page ?? 1
  const lastPage    = data?.last_page    ?? 1

  const columns = [
    { key: 'admin',       label: t('admin.audit.col_admin'),  render: r => r.admin ? `${r.admin.prenom} ${r.admin.nom}` : '—' },
    { key: 'action',      label: t('admin.audit.col_action'), render: r => <span className="font-mono text-xs text-ink">{r.action}</span> },
    { key: 'entite_type', label: t('admin.audit.col_type') },
    {
      key: 'entite_id',
      label: 'ID',
      render: r => (
        <span className="font-mono text-xs text-ghost truncate max-w-32 block">{r.entite_id ?? '—'}</span>
      ),
    },
    { key: 'ip_address',  label: t('admin.audit.col_ip'),   render: r => <span className="font-mono text-xs text-ghost">{r.ip_address ?? '—'}</span> },
    {
      key: 'created_at',
      label: t('admin.audit.col_date'),
      render: r => <span className="text-ghost text-xs whitespace-nowrap">{formatDate(r.created_at)}</span>,
    },
  ]

  return (
    <AdminLayout title={t('admin.audit.titre')}>
      {isLoading ? (
        <p className="text-sm text-ghost">{t('admin.commun.chargement')}</p>
      ) : (
        <AdminTable
          columns={columns}
          rows={logs}
          emptyLabel={t('admin.audit.aucun')}
          currentPage={currentPage}
          lastPage={lastPage}
          onPage={setPage}
        />
      )}
    </AdminLayout>
  )
}
