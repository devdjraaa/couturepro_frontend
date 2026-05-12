import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { AdminLayout, AdminTable, AdminBadge, AtelierAvatar } from '@/components/admin'
import { useAdminAteliers, useGelerAtelier, useDegelerAtelier } from '@/hooks/admin/useAteliers'
import { formatDate } from '@/utils/formatDate'

const INPUT   = 'border border-edge rounded-xl px-3 py-2 text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'
const SELECT  = 'border border-edge rounded-xl px-3 py-2 text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'

export default function AteliersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statut, setStatut] = useState('')

  const { data, isLoading } = useAdminAteliers({ search, statut })
  const geler   = useGelerAtelier()
  const degeler = useDegelerAtelier()

  const ateliers = data?.data ?? []

  const columns = [
    {
      key: 'nom',
      label: t('admin.ateliers.col_atelier'),
      render: r => (
        <button onClick={() => navigate(`/admin/ateliers/${r.id}`)} className="text-left">
          <AtelierAvatar nom={r.nom} />
        </button>
      ),
    },
    {
      key: 'proprietaire',
      label: t('admin.ateliers.col_proprietaire'),
      render: r => r.proprietaire ? `${r.proprietaire.prenom} ${r.proprietaire.nom}` : '—',
    },
    { key: 'statut',          label: t('admin.ateliers.col_statut'),    render: r => <AdminBadge value={r.statut} /> },
    { key: 'clients_count',   label: t('admin.ateliers.col_clients')  },
    { key: 'commandes_count', label: t('admin.ateliers.col_commandes') },
    { key: 'created_at',      label: t('admin.ateliers.col_cree_le'),  render: r => (
      <span className="text-ghost text-xs whitespace-nowrap">{formatDate(r.created_at)}</span>
    )},
    {
      key: 'actions',
      label: '',
      render: r => (
        <div className="flex gap-2">
          {r.statut === 'gele' ? (
            <button
              onClick={() => degeler.mutate(r.id)}
              className="text-xs font-medium text-success hover:text-success/70 transition-colors"
            >
              {t('admin.commun.degeler')}
            </button>
          ) : (
            <button
              onClick={() => geler.mutate(r.id)}
              className="text-xs font-medium text-danger hover:text-danger/70 transition-colors"
            >
              {t('admin.commun.geler')}
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <AdminLayout title={t('admin.ateliers.titre')}>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ghost pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('admin.ateliers.chercher')}
            className={`${INPUT} pl-8`}
          />
        </div>
        <select value={statut} onChange={e => setStatut(e.target.value)} className={SELECT}>
          <option value="">{t('admin.ateliers.statuts.tous')}</option>
          <option value="actif">{t('admin.ateliers.statuts.actif')}</option>
          <option value="expire">{t('admin.ateliers.statuts.expire')}</option>
          <option value="gele">{t('admin.ateliers.statuts.gele')}</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-ghost">{t('admin.commun.chargement')}</p>
      ) : (
        <>
          <AdminTable columns={columns} rows={ateliers} emptyLabel={t('admin.ateliers.aucun')} />
          {data?.last_page > 1 && (
            <p className="text-xs text-ghost mt-3 text-right">
              {t('admin.ateliers.pagination', { current: data.current_page, last: data.last_page, total: data.total })}
            </p>
          )}
        </>
      )}
    </AdminLayout>
  )
}
