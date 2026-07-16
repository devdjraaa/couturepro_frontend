import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X, Heart, MessageCircle, Send, ShoppingBag, Award, Download, Lock, ImagePlus, Megaphone, Video } from 'lucide-react'
import VitrineShell from './VitrineChrome'
import { getCreator, toggleLike, toggleAbonnement, acheterPatron } from './vitrineApi'
import GarmentVisual from './GarmentVisual'
import { useDevise } from './vitrineCurrency'
import { useFavoris } from './useFavoris'
import { avisService } from '@/services/avisService'
import { devisService } from '@/services/devisService'
import { vitrineStatsService } from '@/services/vitrineStatsService'
import { signalementService } from '@/services/signalementService'
import { usePageMeta } from '@/hooks/usePageMeta'
import { SkeletonCreatorProfile } from './VitrineSkeletons'

const btnPrimary = 'inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl bg-primary text-inverse hover:bg-primary-600 transition'
const btnOutline = 'inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl border border-edge text-ink hover:border-primary hover:text-primary transition'

// P164 : « Passer commande » en 3 étapes — coordonnées → détails → récapitulatif.
function DevisModal({ atelierId, createur, wa, onClose, onTrack }) {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    nom: '', prenom: '', telephone: '', email: '',              // étape 1
    modele: '', type_vetement: '', taille: '', particularites: '', budget: '', delai: '', // étape 2
  })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const step1Ok = form.nom.trim() && form.telephone.trim()
  const step2Ok = form.type_vetement.trim()

  const nomComplet = `${form.prenom} ${form.nom}`.trim()
  const buildDescription = () => {
    const lines = []
    if (form.modele.trim()) lines.push(`${t('vitrine.devis_modal.model')} : ${form.modele.trim()}`)
    if (form.type_vetement.trim()) lines.push(`${t('vitrine.devis_modal.type')} : ${form.type_vetement.trim()}`)
    if (form.taille.trim()) lines.push(`${t('vitrine.devis_modal.size')} : ${form.taille.trim()}`)
    if (form.particularites.trim()) lines.push(`${t('vitrine.devis_modal.specifics')} : ${form.particularites.trim()}`)
    return lines.join('\n')
  }

  const handleSubmit = async () => {
    if (sending) return
    setSending(true)
    onTrack()
    const contact = form.telephone.trim() + (form.email.trim() ? ` / ${form.email.trim()}` : '')
    try {
      await devisService.submit(atelierId, {
        nom:         nomComplet,
        contact,
        description: buildDescription() || form.type_vetement.trim(),
        budget:      form.budget ? String(form.budget) : null,
        delai:       form.delai || null,
      })
    } catch { /* la demande WhatsApp reste possible même si l'enregistrement échoue */ }

    if (wa) {
      const msg =
        `Bonjour ${createur}, je souhaite passer commande.\n` +
        `${t('vitrine.devis_modal.name')} : ${nomComplet}\n` +
        `${t('vitrine.devis_modal.phone')} : ${form.telephone}\n` +
        (form.email ? `${t('vitrine.devis_modal.email')} : ${form.email}\n` : '') +
        buildDescription() + '\n' +
        (form.budget ? `${t('vitrine.devis_modal.budget')} : ${form.budget} FCFA\n` : '') +
        (form.delai ? `${t('vitrine.devis_modal.delay')} : ${form.delai}\n` : '')
      window.open(`${wa}?text=${encodeURIComponent(msg)}`, '_blank')
    }
    setSending(false)
    setSent(true)
  }

  const inputCls = 'w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30'
  const labelCls = 'block text-xs font-medium text-dim mb-1'
  const recapRow = (label, val) => val ? (
    <div className="flex justify-between gap-3 text-[13px] py-1 border-b border-edge/60">
      <span className="text-dim">{label}</span><span className="text-ink text-right font-medium">{val}</span>
    </div>
  ) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
      <div className="bg-card border border-edge rounded-2xl shadow-xl w-full max-w-md p-6 relative max-h-[90dvh] overflow-y-auto">
        <button onClick={onClose} aria-label="Fermer" className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-ghost hover:text-ink transition">
          <X size={16} />
        </button>

        <h2 className="font-display font-bold text-xl text-ink mb-1">{t('vitrine.devis_modal.title')}</h2>
        <p className="text-sm text-dim mb-4">{t('vitrine.devis_modal.subtitle')} <strong className="text-ink">{createur}</strong></p>

        {sent ? (
          <div className="py-6 text-center">
            <p className="text-2xl mb-2">✓</p>
            <p className="text-sm text-success font-medium mb-1">{t('vitrine.devis_modal.success_title')}</p>
            <p className="text-xs text-dim">{wa ? t('vitrine.devis_modal.success_wa') : t('vitrine.devis_modal.success_no_wa')}</p>
            <button onClick={onClose} className="mt-4 text-sm font-semibold text-primary hover:underline">{t('vitrine.devis_modal.close')}</button>
          </div>
        ) : (
          <>
            {/* Indicateur d'étapes */}
            <div className="flex items-center mb-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center flex-1 last:flex-none">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${n <= step ? 'bg-primary text-inverse' : 'bg-subtle text-ghost'}`}>{n}</div>
                  {n < 3 && <div className={`flex-1 h-0.5 mx-1 ${n < step ? 'bg-primary' : 'bg-edge'}`} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>{t('vitrine.devis_modal.firstname')}</label>
                    <input value={form.prenom} onChange={set('prenom')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{t('vitrine.devis_modal.name')} *</label>
                    <input value={form.nom} onChange={set('nom')} placeholder={t('vitrine.devis_modal.name_placeholder')} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>{t('vitrine.devis_modal.phone')} *</label>
                  <input value={form.telephone} onChange={set('telephone')} placeholder={t('vitrine.devis_modal.phone_placeholder')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t('vitrine.devis_modal.email')}</label>
                  <input type="email" value={form.email} onChange={set('email')} className={inputCls} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>{t('vitrine.devis_modal.model')}</label>
                  <input value={form.modele} onChange={set('modele')} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>{t('vitrine.devis_modal.type')} *</label>
                    <input value={form.type_vetement} onChange={set('type_vetement')} placeholder={t('vitrine.devis_modal.type_placeholder')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{t('vitrine.devis_modal.size')}</label>
                    <input value={form.taille} onChange={set('taille')} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>{t('vitrine.devis_modal.specifics')}</label>
                  <textarea value={form.particularites} onChange={set('particularites')} rows={2} maxLength={500}
                            placeholder={t('vitrine.devis_modal.description_placeholder')} className={`${inputCls} resize-none`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>{t('vitrine.devis_modal.budget')}</label>
                    <input type="number" min="0" value={form.budget} onChange={set('budget')} placeholder={t('vitrine.devis_modal.budget_placeholder')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{t('vitrine.devis_modal.delay')}</label>
                    <select value={form.delai} onChange={set('delai')} className={`${inputCls} text-dim`}>
                      <option value="">—</option>
                      <option value="Moins de 2 semaines">{t('vitrine.devis_modal.delay_1')}</option>
                      <option value="2 à 4 semaines">{t('vitrine.devis_modal.delay_2')}</option>
                      <option value="1 à 2 mois">{t('vitrine.devis_modal.delay_3')}</option>
                      <option value="Plus de 2 mois">{t('vitrine.devis_modal.delay_4')}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <p className="text-xs text-dim mb-2">{t('vitrine.devis_modal.recap_intro')}</p>
                <div className="bg-subtle rounded-lg px-3 py-2">
                  {recapRow(t('vitrine.devis_modal.name'), nomComplet)}
                  {recapRow(t('vitrine.devis_modal.phone'), form.telephone)}
                  {recapRow(t('vitrine.devis_modal.email'), form.email)}
                  {recapRow(t('vitrine.devis_modal.model'), form.modele)}
                  {recapRow(t('vitrine.devis_modal.type'), form.type_vetement)}
                  {recapRow(t('vitrine.devis_modal.size'), form.taille)}
                  {recapRow(t('vitrine.devis_modal.specifics'), form.particularites)}
                  {recapRow(t('vitrine.devis_modal.budget'), form.budget ? `${form.budget} FCFA` : '')}
                  {recapRow(t('vitrine.devis_modal.delay'), form.delai)}
                </div>
                {!wa && <p className="text-xs text-ghost mt-2">{t('vitrine.devis_modal.no_wa')}</p>}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-2 mt-4">
              {step > 1 && (
                <button type="button" onClick={() => setStep((s) => s - 1)}
                        className="px-4 py-2.5 rounded-xl border border-edge text-ink text-sm font-semibold hover:border-primary hover:text-primary transition">
                  {t('vitrine.devis_modal.back')}
                </button>
              )}
              {step < 3 ? (
                <button type="button" onClick={() => setStep((s) => s + 1)} disabled={(step === 1 && !step1Ok) || (step === 2 && !step2Ok)}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-inverse font-semibold text-sm hover:bg-primary-600 transition disabled:opacity-50">
                  {t('vitrine.devis_modal.next')}
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={sending}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-inverse font-semibold text-sm hover:bg-primary-600 transition disabled:opacity-60">
                  {sending ? t('vitrine.devis_modal.sending') : (wa ? t('vitrine.devis_modal.send_wa') : t('vitrine.devis_modal.send'))}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// P161-162 : achat d'un patron payant. Collecte les coordonnées (pour le reçu) puis
// redirige vers la page de paiement FedaPay. Après paiement, retour sur le reçu (code).
function PatronModal({ patron, format, onClose }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ acheteur_nom: '', acheteur_email: '', acheteur_tel: '' })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (sending) return
    if (!form.acheteur_nom.trim()) { setError(t('vitrine.patron.buy_name_required')); return }
    if (!form.acheteur_email.trim() && !form.acheteur_tel.trim()) { setError(t('vitrine.patron.buy_contact_hint')); return }
    setError('')
    setSending(true)
    const res = await acheterPatron(patron.id, {
      acheteur_nom:   form.acheteur_nom.trim(),
      acheteur_email: form.acheteur_email.trim() || null,
      acheteur_tel:   form.acheteur_tel.trim() || null,
    })
    if (res?.checkout_url) {
      window.location.href = res.checkout_url // redirection vers le paiement
    } else {
      setSending(false)
      setError(t('vitrine.patron.buy_error'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
      <div className="bg-card border border-edge rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} aria-label="Fermer" className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-ghost hover:text-ink transition">
          <X size={16} />
        </button>
        <h2 className="font-display font-bold text-xl text-ink mb-1">{t('vitrine.patron.buy_title', { titre: patron.titre })}</h2>
        <p className="text-sm text-primary font-bold mb-4">{format(patron.prix)}</p>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-dim mb-1">{t('vitrine.patron.buy_name')} *</label>
            <input value={form.acheteur_nom} onChange={set('acheteur_nom')} maxLength={120}
                   className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dim mb-1">{t('vitrine.patron.buy_email')}</label>
              <input type="email" value={form.acheteur_email} onChange={set('acheteur_email')}
                     className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dim mb-1">{t('vitrine.patron.buy_tel')}</label>
              <input value={form.acheteur_tel} onChange={set('acheteur_tel')}
                     className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <p className="text-xs text-ghost">{t('vitrine.patron.buy_contact_hint')}</p>
          {error && <p className="text-xs text-danger">{error}</p>}
          <button type="submit" disabled={sending} className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-inverse font-semibold text-sm hover:bg-primary-600 transition disabled:opacity-60">
            <Download size={16} />{sending ? t('vitrine.patron.buy_paying') : t('vitrine.patron.buy_pay')}
          </button>
        </form>
      </div>
    </div>
  )
}

const MAX_AVIS_PHOTOS = 3

function AvisForm({ atelierId }) {
  const { t } = useTranslation()
  const [nom, setNom] = useState('')
  const [note, setNote] = useState(5)
  const [texte, setTexte] = useState('')
  const [photos, setPhotos] = useState([])   // P137 : File[]
  const [previews, setPreviews] = useState([])
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const addPhotos = (e) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_AVIS_PHOTOS - photos.length)
    if (files.length === 0) return
    setPhotos((p) => [...p, ...files])
    setPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))])
    e.target.value = ''
  }
  const removePhoto = (i) => {
    setPhotos((p) => p.filter((_, j) => j !== i))
    setPreviews((p) => p.filter((_, j) => j !== i))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!nom.trim() || sending) return
    setSending(true)
    try {
      await avisService.submit(atelierId, { auteur_nom: nom.trim(), note, texte: texte.trim() || null, photos })
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

      {/* P137 : photos de l'avis (ex. le client portant l'article) */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {previews.map((src, i) => (
          <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-edge">
            <img src={src} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
            <button type="button" onClick={() => removePhoto(i)} aria-label="Retirer"
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white"><X size={11} /></button>
          </div>
        ))}
        {photos.length < MAX_AVIS_PHOTOS && (
          <label className="w-14 h-14 rounded-lg border-2 border-dashed border-edge flex items-center justify-center text-ghost hover:border-primary hover:text-primary transition cursor-pointer" title={t('vitrine.profil.avis_photos')}>
            <ImagePlus size={18} />
            <input type="file" accept="image/*" multiple className="hidden" onChange={addPhotos} />
          </label>
        )}
      </div>

      <button type="submit" disabled={sending} className="text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-inverse hover:bg-primary-600 transition disabled:opacity-60">
        {t('vitrine.profil.avis_send')}
      </button>
    </form>
  )
}

export default function CreateurProfilPage() {
  const { t } = useTranslation()
  const { format } = useDevise()
  const { toggle } = useFavoris()
  const { slug } = useParams()
  const [c, setC] = useState(undefined) // undefined = loading, null = introuvable
  const [reported, setReported] = useState(() => new Set())
  const [signaled, setSignaled] = useState(() => new Set())
  const [devisOpen, setDevisOpen] = useState(false)
  const [patronBuy, setPatronBuy] = useState(null)            // P161 : patron en cours d'achat
  const [likeState, setLikeState] = useState({})              // P159 : { [vetementId]: { likes, liked } }
  const [abo, setAbo] = useState({ abonne: false, abonnes: 0 }) // P173

  useEffect(() => { getCreator(slug).then((d) => setC(d ?? null)) }, [slug])
  useEffect(() => { window.scrollTo(0, 0) }, [slug])
  useEffect(() => { if (c && c.id) vitrineStatsService.track(c.id, 'visite') }, [c?.id])

  // Initialise l'état likes/abonnement depuis la réponse API (état propre à ce visiteur).
  useEffect(() => {
    if (!c || !c.id) return
    const init = {}
    for (const cr of c.creations || []) init[cr.id] = { likes: cr.likes ?? 0, liked: !!cr.liked }
    setLikeState(init)
    setAbo({ abonne: !!c.abonne, abonnes: c.abonnes ?? 0 })
  }, [c?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // P159 : like/unlike optimiste d'une création.
  const onLike = async (vetementId) => {
    setLikeState((s) => {
      const cur = s[vetementId] || { likes: 0, liked: false }
      const liked = !cur.liked
      return { ...s, [vetementId]: { liked, likes: Math.max(0, cur.likes + (liked ? 1 : -1)) } }
    })
    const res = await toggleLike(vetementId)
    if (res) setLikeState((s) => ({ ...s, [vetementId]: { likes: res.likes, liked: res.liked } }))
  }

  // P173 : s'abonner / se désabonner (optimiste). On garde aussi le favori local (FavorisPage).
  const onSubscribe = async () => {
    toggle(c.id)
    setAbo((a) => ({ abonne: !a.abonne, abonnes: Math.max(0, a.abonnes + (a.abonne ? -1 : 1)) }))
    const res = await toggleAbonnement(c.id)
    if (res) setAbo({ abonne: res.abonne, abonnes: res.abonnes })
  }

  useEffect(() => {
    if (!c) return
    const s = Object.assign(document.createElement('script'), { type: 'application/ld+json', id: 'gx-creator-ld' })
    s.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: c.nom,
      ...(c.bio ? { description: c.bio } : {}),
      ...(c.logo_url ? { image: c.logo_url } : {}),
      address: { '@type': 'PostalAddress', addressLocality: c.ville, addressCountry: 'BJ' },
      url: `${window.location.origin}/createurs/${slug}`,
      ...(c.note ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: c.note, ratingCount: Array.isArray(c.avis) ? c.avis.length : (c.avis ?? 1) } } : {}),
    })
    document.head.appendChild(s)
    return () => { document.getElementById('gx-creator-ld')?.remove() }
  }, [c?.id, slug])

  usePageMeta({
    title:       c?.nom ?? undefined,
    description: c?.bio ?? (c ? `Découvrez les créations de ${c.nom} sur Gextimo.` : undefined),
    image:       c?.logo_url ?? undefined,
    path:        c ? `/createurs/${slug}` : undefined,
    type:        c ? 'profile' : 'website',
  })

  if (c === undefined) {
    return <SkeletonCreatorProfile />
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
  // P177 : réseaux supplémentaires.
  const liUrl = r.linkedin ? (r.linkedin.startsWith('http') ? r.linkedin : `https://linkedin.com/in/${r.linkedin.replace(/^@/, '')}`) : null
  const ytUrl = r.youtube ? (r.youtube.startsWith('http') ? r.youtube : `https://youtube.com/@${r.youtube.replace(/^@/, '')}`) : null
  const ttUrl = r.tiktok ? (r.tiktok.startsWith('http') ? r.tiktok : `https://tiktok.com/@${r.tiktok.replace(/^@/, '')}`) : null
  const socialCls = 'text-xs font-semibold px-3 py-1.5 rounded-full border border-edge text-dim hover:text-primary hover:border-primary transition'
  const merites = Array.isArray(c.merites) ? c.merites : []

  const reportAvis = async (id) => {
    setReported((s) => new Set(s).add(id))
    try { await avisService.report(id) } catch { /* erreur silencieuse */ }
  }

  const trackContact = () => vitrineStatsService.track(c?.id, 'contact')
  const goToAvis = () => document.getElementById('avis-section')?.scrollIntoView({ behavior: 'smooth' })
  const signaler = (type, id) => { setSignaled((s) => new Set(s).add(id)); signalementService.report(type, id) }
  const cols = c.collections || []
  // PL-6 : annonce de collection la plus récente (mise en avant en bandeau).
  const annonce = cols
    .filter(col => col.annonce_at)
    .sort((a, b) => new Date(b.annonce_at) - new Date(a.annonce_at))[0]

  const renderGrid = (items) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((m) => (
        <div key={m.id} className="bg-card border border-edge rounded-lg overflow-hidden">
          {m.image_url ? (
            <img src={m.image_url} alt={m.nom} className="h-[170px] w-full object-cover" loading="lazy" />
          ) : (
            <div className="h-[170px] relative">
              <GarmentVisual cat={m.cat} gradient={m.gradient} className="h-full w-full" />
              <span data-theme="dark" className="absolute top-2.5 left-2.5 text-inverse text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-inset">{m.type}</span>
            </div>
          )}
          <div className="px-3.5 pt-3">
            <h4 className="font-semibold text-[14.5px] text-ink">{m.nom}</h4>
            <div className="font-bold text-primary text-[14px]">{format(m.prix) || t('vitrine.profil.on_quote')}</div>
          </div>
          {/* P160 : 4 boutons par création — ❤️ J'aime, 💬 Commenter, 📩 Contacter, 🛒 Commander */}
          <div className="px-3 py-2.5 flex items-center gap-0.5">
            <button onClick={() => onLike(m.id)} title={t('vitrine.profil.like')} aria-label={t('vitrine.profil.like')}
                    className="flex items-center gap-1 text-[13px] px-2 py-1.5 rounded-lg hover:bg-app transition">
              <Heart size={16} className={likeState[m.id]?.liked ? 'fill-primary text-primary' : 'text-dim'} />
              <span className="text-dim tabular-nums">{likeState[m.id]?.likes ?? 0}</span>
            </button>
            <button onClick={goToAvis} title={t('vitrine.profil.comment')} aria-label={t('vitrine.profil.comment')}
                    className="p-1.5 rounded-lg text-dim hover:bg-app hover:text-primary transition">
              <MessageCircle size={16} />
            </button>
            {wa
              ? <a href={waHref('vitrine.profil.wa_message', { nom: c.nom })} onClick={trackContact} target="_blank" rel="noopener noreferrer" title={t('vitrine.profil.contact')} aria-label={t('vitrine.profil.contact')} className="p-1.5 rounded-lg text-dim hover:bg-app hover:text-primary transition"><Send size={16} /></a>
              : <button title={t('vitrine.profil.contact')} aria-label={t('vitrine.profil.contact')} className="p-1.5 rounded-lg text-ghost cursor-default"><Send size={16} /></button>}
            <div className="flex-1" />
            {wa
              ? <a href={waHref('vitrine.profil.wa_order', { nom: c.nom, modele: m.nom })} onClick={trackContact} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[12.5px] px-3 py-1.5 rounded-[10px] bg-primary text-inverse hover:bg-primary-600 transition"><ShoppingBag size={14} />{t('vitrine.profil.order')}</a>
              : <button className="inline-flex items-center gap-1 font-semibold text-[12.5px] px-3 py-1.5 rounded-[10px] bg-primary text-inverse hover:bg-primary-600 transition"><ShoppingBag size={14} />{t('vitrine.profil.order')}</button>}
          </div>
          {/* P161 : bouton Télécharger (contenu payant) */}
          {m.patron && (
            <div className="px-3.5 pb-2">
              <button onClick={() => setPatronBuy(m.patron)}
                      className="w-full inline-flex items-center justify-center gap-2 text-[13px] font-semibold px-3 py-2 rounded-[10px] border border-primary/40 text-primary hover:bg-primary-50 transition">
                <Lock size={13} />{t('vitrine.patron.download_paid', { prix: format(m.patron.prix) })}
              </button>
            </div>
          )}
          <div className="px-3.5 pb-2.5">
            {signaled.has(m.id)
              ? <span className="text-[10px] text-ghost">⚑ {t('vitrine.profil.report_done')}</span>
              : <button onClick={() => signaler('creation', m.id)} className="text-[10px] text-ghost hover:text-danger">⚑ {t('vitrine.profil.report')}</button>}
          </div>
        </div>
      ))}
    </div>
  )
  // P171 : 4 compteurs publics officiels — 👥 Abonnés, ⭐ Avis, 🖼️ Publications, 🛒 Commandes.
  const avisCount = Array.isArray(c.avis) ? c.avis.length : (c.avis ?? 0)
  const stats = [
    { v: abo.abonnes,                        l: t('vitrine.profil.stat_abonnes') },
    { v: avisCount,                          l: t('vitrine.profil.stat_avis') },
    { v: c.nb_creations ?? creations.length, l: t('vitrine.profil.stat_publications') },
    { v: c.commandes ?? 0,                   l: t('vitrine.profil.stat_commandes') },
  ]

  return (
    <VitrineShell>
      {/* P134 : bannière photo/GIF/vidéo, sinon dégradé par défaut */}
      {c.banniere_url ? (
        c.banniere_type === 'video'
          ? <video src={c.banniere_url} className="h-[180px] w-full object-cover" autoPlay muted loop playsInline />
          : <img src={c.banniere_url} alt="" className="h-[180px] w-full object-cover" />
      ) : (
        <div className="h-[180px]" style={{ background: c.gradient }} />
      )}
      <div className="max-w-[1180px] mx-auto px-5">
        {/* Carte profil */}
        <div className="bg-card border border-edge rounded-lg -mt-[60px] relative p-6 flex flex-wrap items-start gap-5 shadow-lg">
          <div className="w-[88px] h-[88px] rounded-2xl overflow-hidden flex items-center justify-center font-display font-bold text-[30px] text-inverse shrink-0 border-4 border-card" style={c.logo_url ? undefined : { background: c.gradient }}>
            {c.logo_url ? <img src={c.logo_url} alt={c.nom} className="w-full h-full object-cover" loading="lazy" /> : c.initiales}
          </div>
          <div className="flex-1 min-w-[220px]">
            <h1 className="font-display text-[26px] text-ink flex items-center gap-2.5 flex-wrap">
              {c.nom}
              {c.verifie && <span className="text-[12px] font-bold text-primary bg-primary-50 px-2.5 py-0.5 rounded-full">{t('vitrine.creators.verified')}</span>}
              {/* PL-8 : badge Designer Pro (plan Atelier+) */}
              {c.badge_pro && (
                <span className="inline-flex items-center gap-1 text-[12px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  <Award size={12} /> {t('vitrine.creators.pro')}
                </span>
              )}
            </h1>
            <div className="text-dim text-[15px] mt-1">{c.specialite}</div>
            <div className="text-dim text-[13px] mt-1">📍 {c.ville}, Bénin</div>
            {c.inscrit_depuis && <div className="text-ghost text-[12.5px] mt-1">🕐 {c.inscrit_depuis}</div>}
            {c.note && <div className="text-sm mt-2"><span className="text-primary font-bold">★ {c.note}</span> <span className="text-dim">({avisCount})</span></div>}
            {c.bio && <p className="text-ink text-sm mt-3 leading-relaxed">{c.bio}</p>}
            {/* PL-6 : annonce de collection mise en avant */}
            {annonce && (
              <div className="mt-3 flex items-start gap-2 bg-primary-50 text-primary rounded-xl px-3 py-2">
                <Megaphone size={15} className="mt-0.5 shrink-0" />
                <p className="text-[13px] font-medium">{annonce.annonce_message}</p>
              </div>
            )}
            {(igUrl || fbUrl || siteUrl || liUrl || ytUrl || ttUrl) && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {igUrl && <a href={igUrl} target="_blank" rel="noopener noreferrer" className={socialCls}>Instagram</a>}
                {fbUrl && <a href={fbUrl} target="_blank" rel="noopener noreferrer" className={socialCls}>Facebook</a>}
                {ttUrl && <a href={ttUrl} target="_blank" rel="noopener noreferrer" className={socialCls}>TikTok</a>}
                {ytUrl && <a href={ytUrl} target="_blank" rel="noopener noreferrer" className={socialCls}>YouTube</a>}
                {liUrl && <a href={liUrl} target="_blank" rel="noopener noreferrer" className={socialCls}>LinkedIn</a>}
                {siteUrl && <a href={siteUrl} target="_blank" rel="noopener noreferrer" className={socialCls}>Site web</a>}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            {c.devis !== false && <button onClick={() => setDevisOpen(true)} className={btnPrimary}>{t('vitrine.profil.quote')}</button>}
            {wa
              ? <a href={waHref('vitrine.profil.wa_message', { nom: c.nom })} onClick={trackContact} target="_blank" rel="noopener noreferrer" className={btnOutline}>{t('vitrine.profil.contact')}</a>
              : <button className={btnOutline}>{t('vitrine.profil.contact')}</button>}
            <button onClick={onSubscribe} className={abo.abonne ? btnPrimary : btnOutline}>
              <Heart size={15} className={abo.abonne ? 'fill-current' : ''} />
              {abo.abonne ? t('vitrine.profil.subscribed') : t('vitrine.profil.subscribe')}
            </button>
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

        {/* Mérites (P174-176) — badges par catégorie, niveaux non atteints grisés. */}
        {merites.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-1">
              <Award size={20} className="text-primary" />
              <h2 className="font-display text-2xl text-ink">{t('vitrine.profil.merites')}</h2>
            </div>
            <p className="text-dim text-sm mb-4">{t('vitrine.profil.merites_intro')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {merites.map((cat) => (
                <div key={cat.cle} className="bg-card border border-edge rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.emoji}</span>
                      <span className="font-semibold text-ink text-[14px]">{cat.label}</span>
                    </div>
                    <span className="text-[11px] text-dim tabular-nums">{cat.valeur}</span>
                  </div>
                  <div className="mb-2.5">
                    <span className="inline-block text-[13px] font-bold text-primary bg-primary-50 px-2.5 py-0.5 rounded-full">{cat.nom}</span>
                    <span className="text-[11px] text-dim ml-2">{t('vitrine.profil.level', { n: cat.niveau })}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cat.niveaux.map((n) => (
                      <span key={n.niveau} title={t('vitrine.profil.level', { n: n.niveau })}
                            className={`text-[10.5px] px-2 py-0.5 rounded-full border ${n.obtenu ? 'border-primary/40 text-primary bg-primary-50' : 'border-edge text-ghost opacity-60'}`}>
                        {n.nom}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PL-7 : vidéos de présentation */}
        {Array.isArray(c.videos) && c.videos.length > 0 && (
          <>
            <h2 className="font-display text-2xl mt-10 mb-5 text-ink">{t('vitrine.profil.videos')}</h2>
            <div className="flex flex-col gap-2">
              {c.videos.map((v, i) => (
                <a key={i} href={v.url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 bg-card border border-edge rounded-xl px-3 py-2.5 text-sm text-primary hover:border-primary transition">
                  <Video size={16} className="shrink-0" />
                  <span className="truncate">{v.titre || v.url}</span>
                </a>
              ))}
            </div>
          </>
        )}

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
        <h2 id="avis-section" className="font-display text-2xl mt-12 mb-5 text-ink">{t('vitrine.profil.reviews')}</h2>
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
                {Array.isArray(r.photos_urls) && r.photos_urls.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {r.photos_urls.map((u, k) => (
                      <a key={k} href={u} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 rounded-lg overflow-hidden border border-edge">
                        <img src={u} alt={`avis ${k + 1}`} className="w-full h-full object-cover" loading="lazy" />
                      </a>
                    ))}
                  </div>
                )}
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

      {patronBuy && (
        <PatronModal patron={patronBuy} format={format} onClose={() => setPatronBuy(null)} />
      )}
    </VitrineShell>
  )
}
