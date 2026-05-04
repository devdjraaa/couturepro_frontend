import { useTranslation } from 'react-i18next'
import { AdminLayout, AdminTable } from '@/components/admin'
import { useAuditLogs } from '@/hooks/admin/useAudit'
import { formatDate } from '@/utils/formatDate'

export default function AuditPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useAuditLogs()
  const logs = data?.data ?? []

  const columns = [
    { key: 'admin',       label: t('admin.audit.col_admin'),  render: r => r.admin ? `${r.admin.prenom} ${r.admin.nom}` : '—' },
    { key: 'action',      label: t('admin.audit.col_action'), render: r => <span className="font-mono text-xs">{r.action}</span> },
    { key: 'entite_type', label: t('admin.audit.col_type') },
    { key: 'entite_id',   label: 'ID',                       render: r => <span className="font-mono text-xs truncate max-w-[8rem] block">{r.entite_id ?? '—'}</span> },
    { key: 'ip_address',  label: t('admin.audit.col_ip') },
    { key: 'created_at',  label: t('admin.audit.col_date'),  render: r => formatDate(r.created_at) },
  ]

  return (
    <AdminLayout title={t('admin.audit.titre')}>
      {isLoading ? <p className="text-sm text-gray-400">{t('admin.commun.chargement')}</p> : (
        <>
          <AdminTable columns={columns} rows={logs} emptyLabel={t('admin.audit.aucun')} />
          {data?.last_page > 1 && (
            <p className="text-xs text-gray-400 mt-3 text-right">
              {t('admin.audit.pagination', { total: data.total, current: data.current_page, last: data.last_page })}
            </p>
          )}
        </>
      )}
    </AdminLayout>
  )
}
