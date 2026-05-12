import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { AdminLayout, AdminTable } from '@/components/admin'
import { useListeNoire, useAddListeNoire, useRemoveListeNoire } from '@/hooks/admin/useListeNoire'
import { formatDate } from '@/utils/formatDate'

const INPUT  = 'w-full border border-edge rounded-xl px-3 py-2 text-sm text-ink bg-card mt-1 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'
const SELECT = 'border border-edge rounded-xl px-3 py-2 text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'
const LABEL  = 'text-xs text-ghost'

export default function ListeNoirePage() {
  const { t } = useTranslation()
  const [typeFilter, setTypeFilter] = useState('')
  const { data, isLoading } = useListeNoire({ type: typeFilter })
  const add    = useAddListeNoire()
  const remove = useRemoveListeNoire()

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ type: 'telephone', valeur: '', raison: '' })

  const entrees = data?.data ?? []

  const columns = [
    { key: 'type',       label: t('admin.liste_noire.col_type') },
    { key: 'valeur',     label: t('admin.liste_noire.col_valeur') },
    { key: 'raison',     label: t('admin.liste_noire.col_raison'),     render: r => r.raison ?? '—' },
    { key: 'admin',      label: t('admin.liste_noire.col_ajoute_par'), render: r => r.admin ? `${r.admin.prenom} ${r.admin.nom}` : '—' },
    {
      key: 'created_at',
      label: t('admin.liste_noire.col_date'),
      render: r => <span className="text-ghost text-xs whitespace-nowrap">{formatDate(r.created_at)}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: r => (
        <button
          onClick={() => { if (confirm(t('admin.liste_noire.retirer_confirm'))) remove.mutate(r.id) }}
          className="text-ghost hover:text-danger transition-colors"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ]

  const handleAdd = async e => {
    e.preventDefault()
    await add.mutateAsync(form)
    setShowModal(false)
    setForm({ type: 'telephone', valeur: '', raison: '' })
  }

  return (
    <AdminLayout title={t('admin.liste_noire.titre')}>
      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-5">
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={SELECT}>
          <option value="">{t('admin.liste_noire.types.tous')}</option>
          <option value="telephone">{t('admin.liste_noire.types.telephone')}</option>
          <option value="email">{t('admin.liste_noire.types.email')}</option>
          <option value="ip">{t('admin.liste_noire.types.ip')}</option>
        </select>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-danger text-inverse text-sm font-medium px-4 py-2 rounded-xl hover:bg-danger/90 transition-colors"
        >
          <Plus size={14} /> {t('admin.liste_noire.ajouter')}
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-ghost">{t('admin.commun.chargement')}</p>
      ) : (
        <AdminTable columns={columns} rows={entrees} emptyLabel={t('admin.liste_noire.aucune')} />
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="font-semibold text-ink mb-4">{t('admin.liste_noire.ajouter_titre')}</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className={LABEL}>{t('admin.liste_noire.col_type')}</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className={INPUT}
                >
                  <option value="telephone">{t('admin.liste_noire.types.telephone')}</option>
                  <option value="email">{t('admin.liste_noire.types.email')}</option>
                  <option value="ip">{t('admin.liste_noire.types.ip')}</option>
                </select>
              </div>
              <div>
                <label className={LABEL}>{t('admin.liste_noire.col_valeur')}</label>
                <input
                  value={form.valeur}
                  onChange={e => setForm(f => ({ ...f, valeur: e.target.value }))}
                  required
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL}>{t('admin.liste_noire.raison_optionnel')}</label>
                <input
                  value={form.raison}
                  onChange={e => setForm(f => ({ ...f, raison: e.target.value }))}
                  className={INPUT}
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="text-sm text-ghost hover:text-dim transition-colors">
                  {t('admin.commun.annuler')}
                </button>
                <button
                  type="submit"
                  disabled={add.isPending}
                  className="bg-danger text-inverse text-sm font-medium px-4 py-2 rounded-xl hover:bg-danger/90 disabled:opacity-50 transition-colors"
                >
                  {add.isPending ? t('admin.liste_noire.ajout') : t('admin.liste_noire.ajouter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
