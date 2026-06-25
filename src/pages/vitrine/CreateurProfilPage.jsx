import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import VitrineShell from './VitrineChrome'
import { getCreator } from './vitrineApi'
import { useDevise } from './vitrineCurrency'
import { useFavoris } from './useFavoris'
import { avisService } from '@/services/avisService'
import { devisService } from '@/services/devisService'
import { vitrineStatsService } from '@/services/vitrineStatsService'
import { signalementService } from '@/services/signalementService'
import { usePageMeta } from '@/hooks/usePageMeta'

const btnPrimary = 'inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl bg-primary text-white hover:bg-primary-600 transition'
const btnOutline = 'inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl border border-edge text-ink hover:border-primary hover:text-primary transition'

function DevisModal({ atelierId, createur, wa, onClose, onTrack }) {
  const [form, setForm] = useState({ nom: '', telephone: '', type_vetement: '', description: '', budget: '', delai: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (sending) return
    setSending(true)
    onTrack()

    // 1. On enregistre la demande côté créateur (visible dans « Ma vitrine »).
    try {
      await devisService.submit(atelierId, {
        nom:         form.nom.trim(),
        contact:     form.telephone.trim(),
        description: form.type_vetement.trim() + (form.description.trim() ? `\n${form.description.trim()}` : ''),
        budget:      form.budget ? String(form.budget) : null,
        delai:       form.delai || null,
      })
    } catch { /* la demande WhatsApp reste possible même si l'enregistrement échoue */ }

    // 2. Si le créateur a activé WhatsApp, on pré-remplit aussi le message.
    if (wa) {
      const msg =
        `Bonjour ${createur}, je souhaite un devis.\n` +
        `Nom : ${form.nom}\n` +
        `Tél : ${form.telephone}\n` +
        `Vêtement : ${form.type_vetement}\n` +
        (form.description ? `Détails : ${form.description}\n` : '') +
        (form.budget ? `Budget : ${form.budget} FCFA\n` : '') +
        (form.delai ? `Délai souhaité : ${form.delai}\n` : '')
      window.open(`${wa}?text=${encodeURIComponent(msg)}`, '_blank')
    }
    setSending(false)
    setSent(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D0D0D]/60 backdrop-blur-sm">
      <div className="bg-card border border-edge rounded-2xl shadow-xl w-full max-w-md p-6 relative max-h-[90dvh] overflow-y-auto">
        <button onClick={onClose} aria-label="Fermer" className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-ghost hover:text-ink transition">
          <X size={16} />
        </button>

        <h2 className="font-display font-bold text-xl text-ink mb-1">Demande de devis</h2>
        <p className="text-sm text-dim mb-4">Auprès de <strong className="text-ink">{createur}</strong></p>

        {sent ? (
          <div className="py-6 text-center">
            <p className="text-2xl mb-2">✓</p>
            <p className="text-sm text-success font-medium mb-1">Demande envoyée !</p>
            <p className="text-xs text-dim">{wa ? 'Le créateur la voit dans son espace et vous répondra sur WhatsApp.' : 'Le créateur la voit dans son espace et vous recontactera.'}</p>
            <button onClick={onClose} className="mt-4 text-sm font-semibold text-primary hover:underline">Fermer</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-dim mb-1">Votre nom *</label>
                <input required value={form.nom} onChange={set('nom')} placeholder="Aminata Diallo"
                       className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-dim mb-1">Téléphone *</label>
                <input required value={form.telephone} onChange={set('telephone')} placeholder="+229 …"
                       className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-dim mb-1">Type de vêtement *</label>
              <input required value={form.type_vetement} onChange={set('type_vetement')} placeholder="Robe de soirée, costume, boubou…"
                     className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <div>
              <label className="block text-xs font-medium text-dim mb-1">Description</label>
              <textarea value={form.description} onChange={set('description')} rows={3} maxLength={500}
                        placeholder="Couleurs, style, occasion, inspirations…"
                        className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-dim mb-1">Budget (FCFA)</label>
                <input type="number" min="0" value={form.budget} onChange={set('budget')} placeholder="ex : 50000"
                       className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-dim mb-1">Délai souhaité</label>
                <select value={form.delai} onChange={set('delai')}
                        className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-dim focus:outline-none">
                  <option value="">—</option>
                  <option value="Moins de 2 semaines">Moins de 2 sem.</option>
                  <option value="2 à 4 semaines">2 à 4 semaines</option>
                  <option value="1 à 2 mois">1 à 2 mois</option>
                  <option value="Plus de 2 mois">Plus de 2 mois</option>
                </select>
              </div>
            </div>

            {!wa && (
              <p className="text-xs text-ghost">Ce créateur n'a pas activé le contact WhatsApp. Votre demande sera transmise lors du prochain contact.</p>
            )}

            <button type="submit" disabled={sending} className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-600 transition disabled:opacity-60">
              {sending ? 'Envoi…' : (wa ? 'Envoyer (+ WhatsApp)' : 'Envoyer la demande')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function AvisForm({ atelierId }) {
  const { t } = useTranslation()
  const [nom, setNom] = useState('')
  const [note, setNote] = useState(5)
  const [texte, setTexte] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!nom.trim() || sending) return
    setSending(true)
    try {
      await avisService.submit(atelierId, { auteur_nom: nom.trim(), note, texte: texte.trim() || null })
      setSent(true)
    } catch { /* erreur silencieuse */ } finally {
      setSending(false)
    }
  }

  if (sent) return <p className="text-sm text-success font-medium">{t('vitrine.profil.avis_thanks')}</p>

  return (
    <form onSubmit={submit} className="bg-card border border-edge rounded-lg p-5 max-w-[520px]">
      <h3 className="font-display text-lg text-ink mb-3">{t('vitrine.profil.avis_leave')}</h3>
      <input value={nom} onChange={(e) => setNom(e.target.value)} maxLength={80} placeholder={t('vitrine.profil.avis_name')}
             className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink mb-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => setNote(n)} className={`text-xl ${n <= note ? 'text-primary' : 'text-ghost'}`} aria-label={`${n}/5`}>★</button>
        ))}
      </div>
      <textarea value={texte} onChange={(e) => setTexte(e.target.value)} rows={3} maxLength={600} placeholder={t('vitrine.profil.avis_text')}
                className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink resize-none mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30" />
      <button type="submit" disabled={sending} className="text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-600 transition disabled:opacity-60">
        {t('vitrine.profil.avis_send')}
      </button>
    </form>
  )
}

export default function CreateurProfilPage() {
  const { t } = useTranslation()
  const { format } = useDevise()
  const { has, toggle } = useFavoris()
  const { slug } = useParams()
  const [c, setC] = useState(undefined) // undefined = loading, null = introuvable
  const [reported, setReported] = useState(() => new Set())
  const [signaled, setSignaled] = useState(() => new Set())
  const [devisOpen, setDevisOpen] = useState(false)

  useEffect(() => { getCreator(slug).then((d) => setC(d ?? null)) }, [slug])
  useEffect(() => { if (c && c.id) vitrineStatsService.track(c.id, 'visite') }, [c?.id])

  usePageMeta({
    title:       c?.nom ?? undefined,
    description: c?.bio ?? (c ? `Découvrez les créations de ${c.nom} sur Gextimo.` : undefined),
    image:       c?.logo_url ?? undefined,
    path:        c ? `/createurs/${slug}` : undefined,
  })

  if (c === undefined) {
    return <VitrineShell><div className="py-24 text-center text-dim">{t('vitrine.loading')}</div></VitrineShell>
  }
  if (c === null) {
    return (
      <VitrineShell>
        <div className="py-24 text-center">
          <h1 className="font-display text-2xl text-ink">{t('vitrine.profil.not_found')}</h1>
          <Link to="/createurs" className={btnPrimary + ' mt-5'}>{t('vitrine.createurs_page.title')}</Link>
        </div>
      </VitrineShell>
    )
  }

  const creations = c.creations || []
  const wa = c.whatsapp ? `https://wa.me/${c.whatsapp}` : null
  const waHref = (key, params) => `${wa}?text=${encodeURIComponent(t(key, params))}`
  const r = c.reseaux || {}
  const igUrl = r.instagram ? (r.instagram.startsWith('http') ? r.instagram : `https://instagram.com/${r.instagram.replace(/^@/, '')}`) : null
  const fbUrl = r.facebook ? (r.facebook.startsWith('http') ? r.facebook : `https://facebook.com/${r.facebook}`) : null
  const siteUrl = r.site_web ? (r.site_web.startsWith('http') ? r.site_web : `https://${r.site_web}`) : null
  const socialCls = 'text-xs font-semibold px-3 py-1.5 rounded-full border border-edge text-dim hover:text-primary hover:border-primary transition'

  const reportAvis = async (id) => {
    setReported((s) => new Set(s).add(id))
    try { await avisService.report(id) } catch { /* erreur silencieuse */ }
  }

  const trackContact = () => vitrineStatsService.track(c?.id, 'contact')
  const signaler = (type, id) => { setSignaled((s) => new Set(s).add(id)); signalementService.report(type, id) }
  const cols = c.collections || []

  const renderGrid = (items) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((m) => (
        <div key={m.id} className="bg-card border border-edge rounded-lg overflow-hidden">
          {m.image_url ? (
            <img src={m.image_url} alt={m.nom} className="h-[170px] w-full object-cover" />
          ) : (
            <div className="h-[170px] flex items-center justify-center text-[40px] relative" style={{ background: m.gradient }}>
              <span className="absolute top-2.5 left-2.5 text-white text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-[#0D0D0D]">{m.type}</span>
              {m.emoji}
            </div>
          )}
          <div className="p-3.5 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[14.5px] text-ink">{m.nom}</h4>
              <div className="font-bold text-primary text-[14px]">{format(m.prix) || t('vitrine.profil.on_quote')}</div>
            </div>
            {wa
              ? <a href={waHref('vitrine.profil.wa_order', { nom: c.nom, modele: m.nom })} onClick={trackContact} target="_blank" rel="noopener noreferrer" className="inline-flex items-center font-semibold text-[13px] px-3.5 py-2 rounded-[10px] bg-primary text-white hover:bg-primary-600 transition">{t('vitrine.profil.order')}</a>
              : <button className="inline-flex items-center font-semibold text-[13px] px-3.5 py-2 rounded-[10px] bg-primary text-white hover:bg-primary-600 transition">{t('vitrine.profil.order')}</button>}
          </div>
          <div className="px-3.5 pb-2">
            {signaled.has(m.id)
              ? <span className="text-[10px] text-ghost">⚑ {t('vitrine.profil.report_done')}</span>
              : <button onClick={() => signaler('creation', m.id)} className="text-[10px] text-ghost hover:text-danger">⚑ {t('vitrine.profil.report')}</button>}
          </div>
        </div>
      ))}
    </div>
  )
  const stats = [
    { v: creations.length, l: t('vitrine.profil.stat_creations') },
    { v: '247', l: t('vitrine.profil.stat_views') },
    { v: '94%', l: t('vitrine.profil.stat_punctuality') },
    { v: c.experience || '—', l: t('vitrine.profil.stat_experience') },
  ]

  return (
    <VitrineShell>
      <div className="h-[180px]" style={{ background: c.gradient }} />
      <div className="max-w-[1180px] mx-auto px-5">
        {/* Carte profil */}
        <div className="bg-card border border-edge rounded-lg -mt-[60px] relative p-6 flex flex-wrap items-start gap-5 shadow-lg">
          <div className="w-[88px] h-[88px] rounded-2xl overflow-hidden flex items-center justify-center font-display font-bold text-[30px] text-white shrink-0 border-4 border-card" style={c.logo_url ? undefined : { background: c.gradient }}>
            {c.logo_url ? <img src={c.logo_url} alt={c.nom} className="w-full h-full object-cover" /> : c.initiales}
          </div>
          <div className="flex-1 min-w-[220px]">
            <h1 className="font-display text-[26px] text-ink flex items-center gap-2.5 flex-wrap">
              {c.nom}
              {c.verifie && <span className="text-[12px] font-bold text-primary bg-primary-50 px-2.5 py-0.5 rounded-full">{t('vitrine.creators.verified')}</span>}
            </h1>
            <div className="text-dim text-[15px] mt-1">{c.specialite}</div>
            <div className="text-dim text-[13px] mt-1">📍 {c.ville}, Bénin</div>
            {c.note && <div className="text-sm mt-2"><span className="text-primary font-bold">★ {c.note}</span> <span className="text-dim">({c.avis})</span></div>}
            {c.bio && <p className="text-ink text-sm mt-3 leading-relaxed">{c.bio}</p>}
            {(igUrl || fbUrl || siteUrl) && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {igUrl && <a href={igUrl} target="_blank" rel="noopener noreferrer" className={socialCls}>Instagram</a>}
                {fbUrl && <a href={fbUrl} target="_blank" rel="noopener noreferrer" className={socialCls}>Facebook</a>}
                {siteUrl && <a href={siteUrl} target="_blank" rel="noopener noreferrer" className={socialCls}>Site web</a>}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <button onClick={() => setDevisOpen(true)} className={btnPrimary}>{t('vitrine.profil.quote')}</button>
            {wa
              ? <a href={waHref('vitrine.profil.wa_message', { nom: c.nom })} onClick={trackContact} target="_blank" rel="noopener noreferrer" className={btnOutline}>{t('vitrine.profil.contact')}</a>
              : <button className={btnOutline}>{t('vitrine.profil.contact')}</button>}
            <button onClick={() => toggle(c.id)} className={btnOutline}>{has(c.id) ? '♥ ' : '♡ '}{t('vitrine.profil.save')}</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-6">
          {stats.map((s) => (
            <div key={s.l} className="bg-card border border-edge rounded-lg p-4 text-center">
              <div className="font-display font-bold text-2xl text-primary">{s.v}</div>
              <div className="text-[12px] text-dim">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Créations */}
        <h2 className="font-display text-2xl mt-10 mb-5 text-ink">{t('vitrine.profil.catalogue')}</h2>
        {creations.length === 0 ? (
          <p className="text-dim">{t('vitrine.profil.no_creations')}</p>
        ) : cols.length > 0 ? (
          <>
            {cols.map((col) => {
              const items = creations.filter((m) => m.collection_id === col.id)
              return items.length ? (
                <div key={col.id} className="mb-7">
                  <h3 className="font-display text-lg text-ink mb-3">{col.nom}</h3>
                  {renderGrid(items)}
                </div>
              ) : null
            })}
            {(() => {
              const autres = creations.filter((m) => !m.collection_id)
              return autres.length ? (
                <div className="mb-7">
                  <h3 className="font-display text-lg text-ink mb-3">{t('vitrine.profil.others')}</h3>
                  {renderGrid(autres)}
                </div>
              ) : null
            })()}
          </>
        ) : (
          renderGrid(creations)
        )}

        {/* Avis */}
        <h2 className="font-display text-2xl mt-12 mb-5 text-ink">{t('vitrine.profil.reviews')}</h2>
        {(c.avis && c.avis.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {c.avis.map((r, i) => (
              <figure key={r.id || i} className="bg-card border border-edge rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <b className="text-[14px] text-ink">{r.auteur_nom}</b>
                  <span className="text-[12px] text-dim">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</span>
                </div>
                <div className="text-primary text-[13px] mb-2">{'★'.repeat(r.note)}{'☆'.repeat(5 - r.note)}</div>
                {r.texte && <p className="text-[13.5px] leading-relaxed text-ink">{r.texte}</p>}
                {r.id && (reported.has(r.id)
                  ? <span className="text-[11px] text-ghost mt-2 inline-block">{t('vitrine.profil.report_done')}</span>
                  : <button onClick={() => reportAvis(r.id)} className="text-[11px] text-ghost hover:text-danger mt-2">{t('vitrine.profil.report')}</button>)}
              </figure>
            ))}
          </div>
        ) : (
          <p className="text-dim mb-6">{t('vitrine.profil.avis_no')}</p>
        )}
        <div className="mb-12"><AvisForm atelierId={c.id} /></div>

        <div className="pb-16 flex items-center gap-4 flex-wrap">
          <Link to="/createurs" className={btnOutline}>{t('vitrine.profil.all_creators')}</Link>
          {signaled.has(c.id)
            ? <span className="text-xs text-ghost">⚑ {t('vitrine.profil.report_done')}</span>
            : <button onClick={() => signaler('profil', c.id)} className="text-xs text-ghost hover:text-danger">⚑ {t('vitrine.profil.report')} ce profil</button>}
        </div>
      </div>

      {devisOpen && (
        <DevisModal
          atelierId={c.id}
          createur={c.nom}
          wa={wa}
          onClose={() => setDevisOpen(false)}
          onTrack={trackContact}
        />
      )}
    </VitrineShell>
  )
}
