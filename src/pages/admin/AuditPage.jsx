import { AdminLayout, AdminTable } from '@/components/admin'
import { useAuditLogs } from '@/hooks/admin/useAudit'
import { formatDate } from '@/utils/formatDate'

export default function AuditPage() {
  const { data, isLoading } = useAuditLogs()
  const logs = data?.data ?? []

  const columns = [
    { key: 'admin',      label: 'Admin',      render: r => r.admin ? `${r.admin.prenom} ${r.admin.nom}` : '—' },
    { key: 'action',     label: 'Action',     render: r => <span className="font-mono text-xs">{r.action}</span> },
    { key: 'entite_type', label: 'Type' },
    { key: 'entite_id',  label: 'ID',         render: r => <span className="font-mono text-xs truncate max-w-[8rem] block">{r.entite_id ?? '—'}</span> },
    { key: 'ip_address', label: 'IP' },
    { key: 'created_at', label: 'Date',       render: r => formatDate(r.created_at) },
  ]

  return (
    <AdminLayout title="Journal d'audit">
      {isLoading ? <p className="text-sm text-gray-400">Chargement…</p> : (
        <>
          <AdminTable columns={columns} rows={logs} emptyLabel="Aucun log" />
          {data?.last_page > 1 && (
            <p className="text-xs text-gray-400 mt-3 text-right">
              {data.total} entrées — Page {data.current_page}/{data.last_page}
            </p>
          )}
        </>
      )}
    </AdminLayout>
  )
}
