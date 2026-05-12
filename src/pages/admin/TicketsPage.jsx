import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AdminLayout, AdminTable, AdminBadge } from '@/components/admin'
import { useAdminTickets } from '@/hooks/admin/useTickets'
import { formatDate } from '@/utils/formatDate'

const SELECT = 'border border-edge rounded-xl px-3 py-2 text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'

const PRIORITE_COLORS = {
  haute:   'text-danger font-medium',
  normale: 'text-warning font-medium',
  basse:   'text-ghost',
}

export default function TicketsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [statut,   setStatut]   = useState('')
  const [priorite, setPriorite] = useState('')

  const { data, isLoading } = useAdminTickets({ statut, priorite })
  const tickets = data?.data ?? []

  const columns = [
    {
      key: 'reference',
      label: t('admin.tickets.col_ref'),
      render: r => (
        <button
          onClick={() => navigate(`/admin/tickets/${r.id}`)}
          className="font-mono text-xs text-primary hover:text-primary-600 transition-colors font-medium"
        >
          {r.reference}
        </button>
      ),
    },
    { key: 'atelier',    label: t('admin.tickets.col_atelier'),  render: r => r.atelier?.nom ?? '—' },
    { key: 'sujet',      label: t('admin.tickets.col_sujet'),    render: r => <span className="text-sm line-clamp-1 max-w-xs">{r.sujet}</span> },
    {
      key: 'priorite',
      label: t('admin.tickets.col_priorite'),
      render: r => <span className={`text-sm ${PRIORITE_COLORS[r.priorite] ?? ''}`}>{r.priorite}</span>,
    },
    { key: 'statut',     label: t('admin.tickets.col_statut'),   render: r => <AdminBadge value={r.statut} /> },
    { key: 'assignedTo', label: t('admin.tickets.col_assigne'),  render: r => r.assignedTo ? `${r.assignedTo.prenom} ${r.assignedTo.nom}` : '—' },
    {
      key: 'created_at',
      label: t('admin.tickets.col_cree_le'),
      render: r => <span className="text-ghost text-xs whitespace-nowrap">{formatDate(r.created_at)}</span>,
    },
  ]

  return (
    <AdminLayout title={t('admin.tickets.titre')}>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-5">
        <select value={statut} onChange={e => setStatut(e.target.value)} className={SELECT}>
          <option value="">{t('admin.tickets.statuts.tous')}</option>
          <option value="ouvert">{t('admin.tickets.statuts.ouvert')}</option>
          <option value="en_cours">{t('admin.tickets.statuts.en_cours')}</option>
          <option value="ferme">{t('admin.tickets.statuts.ferme')}</option>
        </select>
        <select value={priorite} onChange={e => setPriorite(e.target.value)} className={SELECT}>
          <option value="">{t('admin.tickets.priorites.toutes')}</option>
          <option value="haute">{t('admin.tickets.priorites.haute')}</option>
          <option value="normale">{t('admin.tickets.priorites.normale')}</option>
          <option value="basse">{t('admin.tickets.priorites.basse')}</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-ghost">{t('admin.commun.chargement')}</p>
      ) : (
        <AdminTable columns={columns} rows={tickets} emptyLabel={t('admin.tickets.aucun')} />
      )}
    </AdminLayout>
  )
}
