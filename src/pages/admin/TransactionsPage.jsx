import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { AdminLayout, AdminTable, AdminBadge, AdminModal, AdminSelectField } from '@/components/admin'
import { useAdminTransactions, useCreateTransaction, useCancelTransaction } from '@/hooks/admin/useTransactions'
import { useAdminAteliers } from '@/hooks/admin/useAteliers'
import { useAdminPlans } from '@/hooks/admin/usePlans'
import { formatDate } from '@/utils/formatDate'

export default function TransactionsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)

  const { data, isLoading }  = useAdminTransactions({ page, per_page: 15 })
  const { data: ateliers = [] } = useAdminAteliers()
  const { data: plans = [] }    = useAdminPlans()
  const create = useCreateTransaction()
  const cancel = useCancelTransaction()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ atelier_id: '', niveau_cle: '' })

  const transactions  = data?.data         ?? []
  const currentPage   = data?.current_page ?? 1
  const lastPage      = data?.last_page    ?? 1
  const ateliersList  = ateliers?.data ?? ateliers

  const columns = [
    {
      key: 'code_transaction',
      label: t('admin.transactions.col_code'),
      render: r => <span className="font-mono text-xs text-ink">{r.code_transaction ?? '—'}</span>,
    },
    { key: 'atelier',    label: t('admin.transactions.col_atelier'), render: r => r.atelier?.nom ?? r.atelier_id },
    { key: 'niveau_cle', label: t('admin.transactions.col_plan') },
    {
      key: 'montant',
      label: t('admin.transactions.col_montant'),
      render: r => (
        <span className="font-semibold text-ink tabular-nums">
          {r.montant?.toLocaleString()}{' '}
          <span className="text-ghost font-normal text-xs">XOF</span>
        </span>
      ),
    },
    { key: 'statut',     label: t('admin.transactions.col_statut'),  render: r => <AdminBadge value={r.statut} /> },
    { key: 'canal',      label: t('admin.transactions.col_canal') },
    {
      key: 'created_at',
      label: t('admin.transactions.col_cree_le'),
      render: r => <span className="text-ghost text-xs whitespace-nowrap">{formatDate(r.created_at)}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: r => r.statut === 'disponible' ? (
        <button
          onClick={() => cancel.mutate(r.id)}
          className="text-xs font-medium text-danger hover:text-danger/70 transition-colors"
        >
          {t('admin.transactions.annuler')}
        </button>
      ) : null,
    },
  ]

  const handleCreate = async e => {
    e.preventDefault()
    await create.mutateAsync(form)
    setShowModal(false)
    setForm({ atelier_id: '', niveau_cle: '' })
  }

  return (
    <AdminLayout title={t('admin.transactions.titre')}>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-inverse text-sm font-medium px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors"
        >
          <Plus size={14} /> {t('admin.transactions.generer_code')}
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-ghost">{t('admin.commun.chargement')}</p>
      ) : (
        <AdminTable
          columns={columns}
          rows={transactions}
          emptyLabel={t('admin.transactions.aucune')}
          currentPage={currentPage}
          lastPage={lastPage}
          onPage={setPage}
        />
      )}

      {showModal && (
        <AdminModal
          onClose={() => setShowModal(false)}
          title={t('admin.transactions.generer_titre')}
          size="md"
          footer={
            <>
              <button type="button" onClick={() => setShowModal(false)} className="text-sm text-ghost hover:text-dim transition-colors">
                {t('admin.commun.annuler')}
              </button>
              <button
                type="submit"
                form="transaction-form"
                disabled={create.isPending}
                className="bg-primary text-inverse text-sm font-medium px-4 py-2 rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors"
              >
                {create.isPending ? t('admin.transactions.generation') : t('admin.transactions.generer')}
              </button>
            </>
          }
        >
          <form id="transaction-form" onSubmit={handleCreate} className="space-y-3">
            <AdminSelectField
              label={t('admin.transactions.col_atelier')}
              value={form.atelier_id}
              onChange={e => setForm(f => ({ ...f, atelier_id: e.target.value }))}
              required
            >
              <option value="">{t('admin.commun.selectionner')}</option>
              {ateliersList.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
            </AdminSelectField>
            <AdminSelectField
              label={t('admin.transactions.col_plan')}
              value={form.niveau_cle}
              onChange={e => setForm(f => ({ ...f, niveau_cle: e.target.value }))}
              required
            >
              <option value="">{t('admin.commun.selectionner')}</option>
              {plans.map(p => <option key={p.id} value={p.cle}>{p.label}</option>)}
            </AdminSelectField>
          </form>
        </AdminModal>
      )}
    </AdminLayout>
  )
}
