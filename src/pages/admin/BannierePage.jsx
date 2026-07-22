import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AdminLayout } from '@/components/admin'
import { useAdminBanniere, useUpdateBanniere } from '@/hooks/admin/useBanniere'
import { useAdminSponsorisation, useUpdateSponsorisation } from '@/hooks/admin/useSponsorisation'

const INPUT = 'w-full border border-edge rounded-xl px-3 py-2 text-sm text-ink bg-card mt-1 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'
const LABEL = 'text-xs text-ghost'

export default function BannierePage() {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminBanniere()
  const update = useUpdateBanniere()
  const [form, setForm] = useState({ actif: false, texte: '', lien: '' })
  const [saved, setSaved] = useState(false)

  const sponso = useAdminSponsorisation()
  const updateSponso = useUpdateSponsorisation()
  const [sForm, setSForm] = useState({ actif: true, offres: [] })
  const [sSaved, setSSaved] = useState(false)

  useEffect(() => {
    if (data) setForm({ actif: !!data.actif, texte: data.texte ?? '', lien: data.lien ?? '' })
  }, [data])

  useEffect(() => {
    if (sponso.data) setSForm({ actif: !!sponso.data.actif, offres: sponso.data.offres ?? [] })
  }, [sponso.data])

  const submit = async (e) => {
    e.preventDefault()
    await update.mutateAsync(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const setOffre = (i, k, v) => setSForm(f => ({ ...f, offres: f.offres.map((o, idx) => idx === i ? { ...o, [k]: v } : o) }))
  const addOffre = () => setSForm(f => ({ ...f, offres: [...f.offres, { jours: '', prix: '' }] }))
  const removeOffre = (i) => setSForm(f => ({ ...f, offres: f.offres.filter((_, idx) => idx !== i) }))

  const submitSponso = async (e) => {
    e.preventDefault()
    await updateSponso.mutateAsync({
      actif: sForm.actif,
      offres: sForm.offres
        .map(o => ({ jours: parseInt(o.jours, 10), prix: parseInt(o.prix, 10) }))
        .filter(o => Number.isFinite(o.jours) && o.jours > 0 && Number.isFinite(o.prix) && o.prix >= 0),
    })
    setSSaved(true)
    setTimeout(() => setSSaved(false), 1500)
  }

  return (
    <AdminLayout title="Bannière & sponsorisation">
      <div className="space-y-6">
        {/* Bannière publicitaire */}
        {isLoading ? (
          <p className="text-sm text-ghost">{t('admin.commun.chargement')}</p>
        ) : (
          <form onSubmit={submit} className="max-w-md space-y-4 bg-card border border-edge rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-ink">Bannière vitrine</h2>
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
              {saved && <span className="text-xs text-success font-medium inline-flex items-center gap-1"><Check size={12} aria-hidden="true" />{t('commun.enregistre')}</span>}
            </div>
            {form.actif && form.texte && (
              <div className="text-center text-[13px] py-2 px-4 rounded-lg bg-[#0D0D0D] text-[#F8F5F0]">{form.texte}</div>
            )}
          </form>
        )}

        {/* Offres de sponsorisation (mise en avant) */}
        {sponso.isLoading ? (
          <p className="text-sm text-ghost">{t('admin.commun.chargement')}</p>
        ) : (
          <form onSubmit={submitSponso} className="max-w-md space-y-4 bg-card border border-edge rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-ink">{t('admin.banniere.sponsorisation_titre')}</h2>
            <p className="text-xs text-ghost">{t('admin.banniere.sponsorisation_desc')}</p>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-ink">Sponsorisation disponible</span>
              <input type="checkbox" checked={sForm.actif} onChange={e => setSForm(f => ({ ...f, actif: e.target.checked }))} />
            </label>
            <div className="space-y-2">
              {sForm.offres.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="number" min="1" value={o.jours} onChange={e => setOffre(i, 'jours', e.target.value)} placeholder="Jours" className={INPUT + ' !mt-0'} />
                  <input type="number" min="0" value={o.prix} onChange={e => setOffre(i, 'prix', e.target.value)} placeholder="Prix (FCFA)" className={INPUT + ' !mt-0'} />
                  <button type="button" onClick={() => removeOffre(i)} aria-label="Supprimer" className="text-ghost hover:text-danger text-xl px-1 leading-none">×</button>
                </div>
              ))}
              {sForm.offres.length === 0 && <p className="text-xs text-ghost">{t('admin.banniere.aucune_offre')}</p>}
              <button type="button" onClick={addOffre} className="text-xs font-medium text-primary hover:text-primary-600">+ Ajouter une offre</button>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={updateSponso.isPending} className="bg-primary text-inverse text-sm font-medium px-4 py-2 rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors">
                {updateSponso.isPending ? '…' : 'Enregistrer'}
              </button>
              {sSaved && <span className="text-xs text-success font-medium inline-flex items-center gap-1"><Check size={12} aria-hidden="true" />{t('commun.enregistre')}</span>}
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  )
}
