import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminLayout } from '@/components/admin'
import { useAdminBanniere, useUpdateBanniere } from '@/hooks/admin/useBanniere'

const INPUT = 'w-full border border-edge rounded-xl px-3 py-2 text-sm text-ink bg-card mt-1 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'
const LABEL = 'text-xs text-ghost'

export default function BannierePage() {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminBanniere()
  const update = useUpdateBanniere()
  const [form, setForm] = useState({ actif: false, texte: '', lien: '' })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (data) setForm({ actif: !!data.actif, texte: data.texte ?? '', lien: data.lien ?? '' })
  }, [data])

  const submit = async (e) => {
    e.preventDefault()
    await update.mutateAsync(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <AdminLayout title="Bannière vitrine">
      {isLoading ? (
        <p className="text-sm text-ghost">{t('admin.commun.chargement')}</p>
      ) : (
        <form onSubmit={submit} className="max-w-md space-y-4 bg-card border border-edge rounded-2xl p-6">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-ink">Bannière active</span>
            <input type="checkbox" checked={form.actif} onChange={e => setForm(f => ({ ...f, actif: e.target.checked }))} />
          </label>
          <div>
            <label className={LABEL}>Texte</label>
            <input value={form.texte} onChange={e => setForm(f => ({ ...f, texte: e.target.value }))} maxLength={300} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Lien (optionnel)</label>
            <input value={form.lien} onChange={e => setForm(f => ({ ...f, lien: e.target.value }))} maxLength={500} placeholder="https://…" className={INPUT} />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={update.isPending} className="bg-primary text-inverse text-sm font-medium px-4 py-2 rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors">
              {update.isPending ? '…' : 'Enregistrer'}
            </button>
            {saved && <span className="text-xs text-success font-medium">✓ Enregistré</span>}
          </div>
          {form.actif && form.texte && (
            <div className="text-center text-[13px] py-2 px-4 rounded-lg bg-[#0D0D0D] text-[#F8F5F0]">{form.texte}</div>
          )}
        </form>
      )}
    </AdminLayout>
  )
}
