import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { AdminLayout, AdminTable, AdminBadge } from '@/components/admin'
import { useAdminTransactions, useCreateTransaction, useCancelTransaction } from '@/hooks/admin/useTransactions'
import { useAdminAteliers } from '@/hooks/admin/useAteliers'
import { useAdminPlans } from '@/hooks/admin/usePlans'
import { formatDate } from '@/utils/formatDate'

export default function TransactionsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminTransactions()
  const { data: ateliers = [] } = useAdminAteliers()
  const { data: plans = [] }    = useAdminPlans()
  const create = useCreateTransaction()
  const cancel = useCancelTransaction()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ atelier_id: '', niveau_cle: '' })

  const transactions = data?.data ?? []

  const columns = [
    { key: 'code_transaction', label: t('admin.transactions.col_code') },
    { key: 'atelier',    label: t('admin.transactions.col_atelier'), render: r => r.atelier?.nom ?? r.atelier_id },
    { key: 'niveau_cle', label: t('admin.transactions.col_plan') },
    { key: 'montant',    label: t('admin.transactions.col_montant'), render: r => `${r.montant?.toLocaleString()} XOF` },
    { key: 'statut',     label: t('admin.transactions.col_statut'), render: r => <AdminBadge value={r.statut} /> },
    { key: 'canal',      label: t('admin.transactions.col_canal') },
    { key: 'created_at', label: t('admin.transactions.col_cree_le'), render: r => formatDate(r.created_at) },
    { key: 'actions', label: '',
      render: r => r.statut === 'disponible' ? (
        <button onClick={() => cancel.mutate(r.id)} className="text-xs text-red-500 hover:underline">
          {t('admin.transactions.annuler')}
        </button>
      ) : null
    },
  ]

  const handleCreate = async e => {
    e.preventDefault()
    await create.mutateAsync(form)
    setShowModal(false)
    setForm({ atelier_id: '', niveau_cle: '' })
  }

  const ateliersList = ateliers?.data ?? ateliers

  return (
    <AdminLayout title={t('admin.transactions.titre')}>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
          <Plus size={14} /> {t('admin.transactions.generer_code')}
        </button>
      </div>

      {isLoading ? <p className="text-sm text-gray-400">{t('admin.commun.chargement')}</p> : (
        <AdminTable columns={columns} rows={transactions} emptyLabel={t('admin.transactions.aucune')} />
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">{t('admin.transactions.generer_titre')}</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">{t('admin.transactions.col_atelier')}</label>
                <select value={form.atelier_id} onChange={e => setForm(f => ({ ...f, atelier_id: e.target.value }))} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400">
                  <option value="">{t('admin.commun.selectionner')}</option>
                  {ateliersList.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">{t('admin.transactions.col_plan')}</label>
                <select value={form.niveau_cle} onChange={e => setForm(f => ({ ...f, niveau_cle: e.target.value }))} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400">
                  <option value="">{t('admin.commun.selectionner')}</option>
                  {plans.map(p => <option key={p.id} value={p.cle}>{p.label}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="text-sm text-gray-500">{t('admin.commun.annuler')}</button>
                <button type="submit" disabled={create.isPending}
                  className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  {create.isPending ? t('admin.transactions.generation') : t('admin.transactions.generer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
