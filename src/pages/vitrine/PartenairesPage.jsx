import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Handshake, X, Send, ExternalLink, CheckCircle2 } from 'lucide-react'
import VitrineShell from './VitrineChrome'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getPartenaires, candidaterPartenaire } from './vitrineApi'

// P204 : formulaire de candidature « Devenir partenaire » (modale flottante).
function CandidatureModal({ categories, onClose, t }) {
  const [form, setForm] = useState({
    nom_organisation: '', pays_region: '', categorie_souhaitee: '',
    type_apport: '', contact_nom: '', contact_email: '', contact_telephone: '', message: '',
  })
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.nom_organisation.trim() || !form.contact_email.trim()) {
      setError(t('vitrine.partenaires.form.err_requis')); return
    }
    setSending(true); setError('')
    const res = await candidaterPartenaire(form)
    setSending(false)
    if (res.ok) setDone(true)
    else setError(t('vitrine.partenaires.form.err_envoi'))
  }

  const inputCls = 'w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30'
  const labelCls = 'block text-xs font-medium text-dim mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
      <div className="bg-card border border-edge rounded-2xl shadow-xl w-full max-w-lg p-6 relative max-h-[90dvh] overflow-y-auto">
        <button onClick={onClose} aria-label={t('commun.fermer')} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-ghost hover:text-ink transition">
          <X size={16} />
        </button>

        {done ? (
          <div className="py-6 text-center">
            <CheckCircle2 size={30} className="mx-auto mb-2 text-success" aria-hidden="true" />
            <p className="text-sm text-success font-medium mb-1">{t('vitrine.partenaires.form.merci_titre')}</p>
            <p className="text-xs text-dim">{t('vitrine.partenaires.form.merci_sous')}</p>
            <button onClick={onClose} className="mt-4 text-sm font-semibold text-primary hover:underline">{t('commun.fermer')}</button>
          </div>
        ) : (
          <>
            <h2 className="font-display font-bold text-xl text-ink mb-1">{t('vitrine.partenaires.form.titre')}</h2>
            <p className="text-sm text-dim mb-4">{t('vitrine.partenaires.form.sous')}</p>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className={labelCls}>{t('vitrine.partenaires.form.organisation')} *</label>
                <input value={form.nom_organisation} onChange={set('nom_organisation')} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t('vitrine.partenaires.form.pays')}</label>
                  <input value={form.pays_region} onChange={set('pays_region')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t('vitrine.partenaires.form.categorie')}</label>
                  <select value={form.categorie_souhaitee} onChange={set('categorie_souhaitee')} className={inputCls}>
                    <option value="">—</option>
                    {(categories || []).map((c) => (
                      <option key={c} value={c}>{t(`vitrine.partenaires.categories.${c}`, { defaultValue: c })}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>{t('vitrine.partenaires.form.apport')}</label>
                <textarea value={form.type_apport} onChange={set('type_apport')} rows={2} className={`${inputCls} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t('vitrine.partenaires.form.contact_nom')}</label>
                  <input value={form.contact_nom} onChange={set('contact_nom')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t('vitrine.partenaires.form.email')} *</label>
                  <input type="email" value={form.contact_email} onChange={set('contact_email')} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>{t('vitrine.partenaires.form.telephone')}</label>
                <input value={form.contact_telephone} onChange={set('contact_telephone')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t('vitrine.partenaires.form.message')}</label>
                <textarea value={form.message} onChange={set('message')} rows={3} className={`${inputCls} resize-none`} />
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <button type="submit" disabled={sending} className="w-full inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl bg-primary text-inverse hover:bg-primary-600 transition disabled:opacity-50">
                <Send size={15} /> {sending ? t('vitrine.partenaires.form.envoi') : t('vitrine.partenaires.form.soumettre')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function PartenairesPage() {
  const { t } = useTranslation()
  // Mentions de partenariat : emplacement optionnel, masqué tant que la clé
  // n'est pas fournie (voir le commentaire au point d'affichage).
  const mentionsPartenariat = t('vitrine.partenaires.mentions', { defaultValue: '' })
  usePageMeta({ title: t('vitrine.partenaires.titre'), description: t('vitrine.partenaires.sous'), path: '/partenaires' })

  const [data, setData] = useState(null)
  const [modal, setModal] = useState(false)

  useEffect(() => { getPartenaires().then(setData) }, [])

  const groupes = data?.groupes ?? []
  const categories = data?.categories ?? []

  return (
    <VitrineShell>
      <section className="py-16">
        <div className="max-w-[980px] mx-auto px-5">
          {/* En-tête + bouton Devenir partenaire */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-primary font-bold text-xs uppercase tracking-[0.15em] mb-1">{t('vitrine.partenaires.eyebrow')}</p>
              <h1 className="font-display text-3xl text-ink">{t('vitrine.partenaires.titre')}</h1>
              <p className="text-dim mt-2 max-w-[560px]">{t('vitrine.partenaires.sous')}</p>
            </div>
            <button onClick={() => setModal(true)} className="shrink-0 inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl bg-primary text-inverse hover:bg-primary-600 transition">
              <Handshake size={16} /> {t('vitrine.partenaires.devenir')}
            </button>
          </div>

          {/* Liste par catégorie (structure évolutive : sections dépliables) */}
          {data === null ? (
            <p className="text-dim">{t('commun.chargement')}</p>
          ) : groupes.length === 0 ? (
            <div className="bg-card border border-edge rounded-2xl p-10 text-center">
              <Handshake size={28} className="mx-auto text-ghost mb-3" />
              <p className="text-dim">{t('vitrine.partenaires.vide')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupes.map((g) => (
                <details key={g.categorie} open className="group bg-card border border-edge rounded-2xl p-5">
                  <summary className="cursor-pointer list-none font-display text-lg text-ink mb-2">
                    {t(`vitrine.partenaires.categories.${g.categorie}`, { defaultValue: g.categorie })}
                    <span className="text-dim text-sm font-normal"> · {g.partenaires.length}</span>
                  </summary>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {g.partenaires.map((p) => (
                      <a key={p.id} href={p.site_url || undefined} target={p.site_url ? '_blank' : undefined} rel="noopener noreferrer"
                         className={`flex items-center gap-3 bg-app border border-edge rounded-xl p-3 ${p.site_url ? 'hover:border-primary transition' : ''}`}>
                        {p.logo_url
                          ? <img src={p.logo_url} alt={p.nom} className="w-12 h-12 rounded-lg object-contain bg-white shrink-0" />
                          : <span className="w-12 h-12 rounded-lg bg-subtle flex items-center justify-center font-display font-bold text-ghost shrink-0">{p.nom?.[0]}</span>}
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-ink truncate">{p.nom}{p.site_url && <ExternalLink size={11} className="inline ml-1 opacity-60" />}</span>
                          {p.pays && <span className="block text-xs text-dim truncate">{p.pays}</span>}
                          {p.description && <span className="block text-xs text-dim line-clamp-2">{p.description}</span>}
                        </span>
                      </a>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          )}

          {/*
            P204 — Pied de page « mentions/politiques partenariat » : emplacement OPTIONNEL.
            Point ouvert du Document Maître (mentions dans les contrats OU affichées ici ?).
            Ne pas développer en dur tant que la décision n'est pas confirmée → masqué par défaut,
            activable via la clé i18n vitrine.partenaires.mentions quand elle sera fournie.
          */}
          {/* Lu une seule fois, avec son repli : le second appel n'avait pas de
              `defaultValue` et passait pour une clé oubliée. */}
          {mentionsPartenariat && (
            <p className="text-xs text-ghost mt-10 text-center max-w-[680px] mx-auto">
              {mentionsPartenariat}
            </p>
          )}
        </div>
      </section>

      {modal && <CandidatureModal categories={categories} onClose={() => setModal(false)} t={t} />}
    </VitrineShell>
  )
}
