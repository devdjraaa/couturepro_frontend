import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, TicketPercent } from 'lucide-react'
import { AdminLayout, AdminBadge } from '@/components/admin'
import { useAdminCodesPromo, useCreateCodePromo, useToggleCodePromo } from '@/hooks/admin/useCodesPromo'
import { formatDate } from '@/utils/formatDate'

// P153-158 : panneau admin des codes promo / ambassadeurs.
const EMPTY = { code: '', type: 'evenement', jours_bonus: '17', expire_at: '', max_utilisations: '', note: '' }
const INPUT = 'w-full border border-edge rounded-xl px-3 py-2 text-sm text-ink bg-card mt-1 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'
const LABEL = 'text-xs text-ghost'

function CodeModal({ onClose, onSubmit, isLoading }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(EMPTY)
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit({
      code:             form.code.toUpperCase().trim(),
      type:             form.type,
      jours_bonus:      Number(form.jours_bonus),
      expire_at:        form.expire_at || null,
      max_utilisations: form.max_utilisations ? Number(form.max_utilisations) : null,
      note:             form.note || null,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-xl">
        <h3 className="font-semibold text-ink mb-4">{t('admin.codes_promo.nouveau_titre')}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={LABEL}>{t('admin.codes_promo.col_code')}</label>
            <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                   placeholder="GEXTIMO15JUILLET" required maxLength={40} className={`${INPUT} font-mono`} />
          </div>
          <div>
            <label className={LABEL}>{t('admin.codes_promo.col_type')}</label>
            <select value={form.type} onChange={set('type')} className={INPUT}>
              <option value="evenement">{t('admin.codes_promo.type_evenement')}</option>
              <option value="ambassadeur">{t('admin.codes_promo.type_ambassadeur')}</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>{t('admin.codes_promo.col_jours')}</label>
              <input type="number" min="1" max="365" value={form.jours_bonus} onChange={set('jours_bonus')} required className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>{t('admin.codes_promo.col_max')}</label>
              <input type="number" min="1" value={form.max_utilisations} onChange={set('max_utilisations')}
                     placeholder={t('admin.codes_promo.illimite')} className={INPUT} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t('admin.codes_promo.col_expire')}</label>
            <input type="datetime-local" value={form.expire_at} onChange={set('expire_at')} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>{t('admin.codes_promo.col_note')}</label>
            <input value={form.note} onChange={set('note')} maxLength={255} className={INPUT} />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
                    className="flex-1 border border-edge text-dim text-sm py-2 rounded-xl hover:text-ink transition-colors">
              {t('admin.commun.annuler')}
            </button>
            <button type="submit" disabled={isLoading}
                    className="flex-1 bg-primary text-inverse text-sm py-2 rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors">
              {isLoading ? '…' : t('admin.codes_promo.creer_btn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CodesPromoPage() {
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const { data, isLoading } = useAdminCodesPromo()
  const create = useCreateCodePromo()
  const toggle = useToggleCodePromo()

  const codes = data?.data ?? []

  const handleCreate = async (payload) => {
    await create.mutateAsync(payload)
    setShowModal(false)
  }

  return (
    <AdminLayout
      title={t('admin.nav.codes_promo')}
      action={
        <button onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-primary text-inverse hover:bg-primary-600 transition-colors">
          <Plus size={13} /> {t('admin.codes_promo.nouveau_btn')}
        </button>
      }
    >
      <div className="bg-card border border-edge rounded-xl overflow-hidden">
        {isLoading ? (
          <p className="text-sm text-ghost p-5">{t('admin.commun.chargement')}</p>
        ) : codes.length === 0 ? (
          <div className="p-10 text-center text-ghost">
            <TicketPercent size={28} className="mx-auto mb-2 opacity-60" />
            <p className="text-sm">{t('admin.codes_promo.aucun')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ghost border-b border-edge">
                  <th className="px-4 py-3">{t('admin.codes_promo.col_code')}</th>
                  <th className="px-4 py-3">{t('admin.codes_promo.col_type')}</th>
                  <th className="px-4 py-3">{t('admin.codes_promo.col_jours')}</th>
                  <th className="px-4 py-3">{t('admin.codes_promo.col_utilisations')}</th>
                  <th className="px-4 py-3">{t('admin.codes_promo.col_expire')}</th>
                  <th className="px-4 py-3">{t('admin.codes_promo.col_statut')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-edge">
                {codes.map(c => {
                  const mort = !c.is_actif || (c.expire_at && new Date(c.expire_at) < new Date())
                  return (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-mono font-semibold text-ink">{c.code}</td>
                      <td className="px-4 py-3 text-dim">{t(`admin.codes_promo.type_${c.type}`)}</td>
                      <td className="px-4 py-3 text-dim">+{c.jours_bonus} j</td>
                      <td className="px-4 py-3 font-semibold text-ink">
                        {c.utilisations_count}{c.max_utilisations ? ` / ${c.max_utilisations}` : ''}
                      </td>
                      <td className="px-4 py-3 text-dim">{c.expire_at ? formatDate(c.expire_at) : '—'}</td>
                      <td className="px-4 py-3">
                        <AdminBadge value={mort ? 'expire' : 'actif'} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => toggle.mutate(c.id)}
                                className={c.is_actif
                                  ? 'text-xs text-danger hover:text-danger/70 transition-colors'
                                  : 'text-xs text-success hover:text-success/70 transition-colors'}>
                          {c.is_actif ? t('admin.codes_promo.desactiver') : t('admin.codes_promo.activer')}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <CodeModal onClose={() => setShowModal(false)} onSubmit={handleCreate} isLoading={create.isPending} />
      )}
    </AdminLayout>
  )
}
