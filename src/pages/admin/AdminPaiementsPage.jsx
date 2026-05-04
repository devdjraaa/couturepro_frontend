import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminLayout, AdminTable, AdminBadge } from '@/components/admin'
import { useAdminPaiements, useValiderPaiement, useRembourserPaiement } from '@/hooks/admin/useAdminPaiements'
import { formatDate } from '@/utils/formatDate'

export default function AdminPaiementsPage() {
  const { t } = useTranslation()
  const [statut,   setStatut]   = useState('')
  const [provider, setProvider] = useState('')

  const { data, isLoading } = useAdminPaiements({ statut, provider })
  const valider    = useValiderPaiement()
  const rembourser = useRembourserPaiement()

  const paiements = data?.data ?? []

  const columns = [
    { key: 'atelier',    label: t('admin.paiements.col_atelier'),  render: r => r.atelier?.nom ?? r.atelier_id },
    { key: 'niveau_cle', label: t('admin.paiements.col_plan') },
    { key: 'montant',    label: t('admin.paiements.col_montant'),   render: r => `${r.montant?.toLocaleString()} XOF` },
    { key: 'provider',   label: t('admin.paiements.col_provider') },
    { key: 'statut',     label: t('admin.paiements.col_statut'),    render: r => <AdminBadge value={r.statut} /> },
    { key: 'created_at', label: t('admin.paiements.col_date'),      render: r => formatDate(r.created_at) },
    { key: 'actions',    label: '',
      render: r => (
        <div className="flex gap-3">
          {(r.statut === 'pending' || r.statut === 'failed') && (
            <button onClick={() => valider.mutate(r.id)} className="text-xs text-green-600 hover:underline">
              {t('admin.paiements.valider')}
            </button>
          )}
          {r.statut === 'completed' && (
            <button onClick={() => rembourser.mutate(r.id)} className="text-xs text-red-500 hover:underline">
              {t('admin.paiements.rembourser')}
            </button>
          )}
        </div>
      )
    },
  ]

  return (
    <AdminLayout title={t('admin.paiements.titre')}>
      <div className="flex gap-3 mb-5">
        <select value={statut} onChange={e => setStatut(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-400">
          <option value="">{t('admin.paiements.statuts.tous')}</option>
          <option value="pending">{t('admin.paiements.statuts.pending')}</option>
          <option value="completed">{t('admin.paiements.statuts.completed')}</option>
          <option value="failed">{t('admin.paiements.statuts.failed')}</option>
          <option value="refunded">{t('admin.paiements.statuts.refunded')}</option>
        </select>
        <select value={provider} onChange={e => setProvider(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-400">
          <option value="">{t('admin.commun.tous_providers')}</option>
          <option value="orange_money">Orange Money</option>
          <option value="wave">Wave</option>
          <option value="mtn_momo">MTN MoMo</option>
        </select>
      </div>

      {isLoading ? <p className="text-sm text-gray-400">{t('admin.commun.chargement')}</p> : (
        <AdminTable columns={columns} rows={paiements} emptyLabel={t('admin.paiements.aucun')} />
      )}
    </AdminLayout>
  )
}
