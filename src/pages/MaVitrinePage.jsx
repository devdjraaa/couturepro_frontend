import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Store, ExternalLink, Copy, Check, Eye, EyeOff, MessageCircle,
  Sparkles, ClipboardList, Wallet, Image as ImageIcon,
} from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { Skeleton } from '@/components/ui'
import { useAuth } from '@/contexts'
import { useDashboard } from '@/hooks/useDashboard'
import { usePlanFeature } from '@/hooks/usePlanFeature'
import { vetementService } from '@/services/vetementService'
import { parametresService } from '@/services/parametresService'
import { collectionService } from '@/services/collectionService'
import { avisService } from '@/services/avisService'
import { devisService } from '@/services/devisService'
import { vitrineStatsService } from '@/services/vitrineStatsService'

import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'
import { IS_NATIVE } from '@/constants/routes'

// Robuste si le backend n'a pas encore le champ : champ absent = considéré publié.
const isPublie = (v) => v.publie_vitrine !== false

function Kpi({ icon: Icon, label, value, hint }) {
  return (
    <div className="bg-card border border-edge rounded-xl p-4">
      <div className="flex items-center gap-2 text-dim text-xs font-medium">
        <Icon size={15} className="text-primary" /> {label}
      </div>
      <div className="text-2xl font-bold font-display text-ink mt-1">{value}</div>
      {hint && <div className="text-2xs text-ghost mt-0.5">{hint}</div>}
    </div>
  )
}

export default function MaVitrinePage() {
  const { atelier } = useAuth()
  const { available: peutSponsoriser } = usePlanFeature('sponsorisation')
  const dash = useDashboard()
  const [creations, setCreations] = useState(null)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(() => new Set())
  const [contactPublic, setContactPublic] = useState(() => !!atelier?.contact_public)
  const [savingContact, setSavingContact] = useState(false)
  const [specialite, setSpecialite] = useState(() => atelier?.specialite || '')
  const [bio, setBio] = useState(() => atelier?.bio || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [logoUrl, setLogoUrl] = useState(() => atelier?.logo_url || null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [instagram, setInstagram] = useState(() => atelier?.instagram || '')
  const [facebook, setFacebook] = useState(() => atelier?.facebook || '')
  const [siteWeb, setSiteWeb] = useState(() => atelier?.site_web || '')
  const [geoMsg, setGeoMsg] = useState('')
  const [collections, setCollections] = useState([])
  const [newCollection, setNewCollection] = useState('')
  const [pendingAvis, setPendingAvis] = useState([])
  const [devis, setDevis] = useState([])
  const [stats, setStats] = useState(null)
  const [verifDoc, setVerifDoc] = useState(null)
  const [verifLien, setVerifLien] = useState('')
  const [verifSending, setVerifSending] = useState(false)
  const [verifSent, setVerifSent] = useState(false)
  const [sponsoJours, setSponsoJours] = useState(7)
  const [sponsoBusy, setSponsoBusy] = useState(false)

  useEffect(() => {
    let on = true
    vetementService.getAll()
      .then((list) => { if (on) setCreations((list || []).filter((v) => !v.is_systeme)) })
      .catch(() => { if (on) setCreations([]) })
    return () => { on = false }
  }, [])

  useEffect(() => { setContactPublic(!!atelier?.contact_public) }, [atelier?.contact_public])
  useEffect(() => { setSpecialite(atelier?.specialite || ''); setBio(atelier?.bio || '') }, [atelier?.specialite, atelier?.bio])
  useEffect(() => { setLogoUrl(atelier?.logo_url || null) }, [atelier?.logo_url])
  useEffect(() => {
    setInstagram(atelier?.instagram || ''); setFacebook(atelier?.facebook || ''); setSiteWeb(atelier?.site_web || '')
  }, [atelier?.instagram, atelier?.facebook, atelier?.site_web])
  useEffect(() => { collectionService.getAll().then((d) => setCollections(d || [])).catch(() => {}) }, [])
  useEffect(() => { avisService.getMine().then((d) => setPendingAvis((d || []).filter((a) => a.statut === 'en_attente' || a.statut === 'signale'))).catch(() => {}) }, [])
  useEffect(() => { devisService.getMine().then((d) => setDevis(d || [])).catch(() => {}) }, [])
  useEffect(() => {
    abonnementService.getSponsoOffres().then((d) => {
      setSponsoOffres(d)
      if (d?.offres?.length) setSponsoJours(d.offres[0].jours)
    }).catch(() => {})
  }, [])
  useEffect(() => { vitrineStatsService.getStats().then(setStats).catch(() => {}) }, [])

  const publicPath = atelier?.id ? `/createurs/${atelier.id}` : '/createurs'
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}${publicPath}` : publicPath
  const nbCreations = creations?.length ?? null
  const nbPubliees = creations ? creations.filter(isPublie).length : null

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard indisponible */ }
  }

  const togglePublication = async (v) => {
    const next = !isPublie(v)
    setBusy((s) => new Set(s).add(v.id))
    setCreations((list) => list.map((x) => (x.id === v.id ? { ...x, publie_vitrine: next } : x)))
    try {
      await vetementService.setPublication(v.id, next)
    } catch (e) {
      if (e?.response?.status === 403) alert(e.response.data?.message || 'Limite atteinte.')
      // échec → on revient à l'état précédent
      setCreations((list) => list.map((x) => (x.id === v.id ? { ...x, publie_vitrine: !next } : x)))
    } finally {
      setBusy((s) => { const n = new Set(s); n.delete(v.id); return n })
    }
  }

  const toggleContact = async () => {
    if (savingContact || !atelier?.nom) return
    const next = !contactPublic
    setContactPublic(next)
    setSavingContact(true)
    try {
      await parametresService.updateAtelier({ nom: atelier.nom, contact_public: next })
    } catch {
      setContactPublic(!next)
    } finally {
      setSavingContact(false)
    }
  }

  const saveProfile = async () => {
    if (savingProfile || !atelier?.nom) return
    setSavingProfile(true)
    setProfileSaved(false)
    try {
      await parametresService.updateAtelier({ nom: atelier.nom, specialite, bio, instagram, facebook, site_web: siteWeb })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    } catch { /* erreur silencieuse */ } finally {
      setSavingProfile(false)
    }
  }

  const useMyPosition = () => {
    if (!navigator.geolocation || !atelier?.nom) return
    setGeoMsg('…')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await parametresService.updateAtelier({ nom: atelier.nom, latitude: pos.coords.latitude, longitude: pos.coords.longitude })
          setGeoMsg('✓ Position enregistrée')
        } catch { setGeoMsg('Échec') }
      },
      () => setGeoMsg('Position refusée'),
    )
  }

  const onLogoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const { logo_url } = await parametresService.uploadAtelierLogo(file)
      setLogoUrl(logo_url)
    } catch { /* erreur silencieuse */ } finally {
      setUploadingLogo(false)
    }
  }

  const addCollection = async () => {
    const nom = newCollection.trim()
    if (!nom) return
    try {
      const c = await collectionService.create(nom)
      setCollections((l) => [...l, c])
      setNewCollection('')
    } catch { /* erreur silencieuse */ }
  }

  const removeCollection = async (id) => {
    setCollections((l) => l.filter((c) => c.id !== id))
    setCreations((list) => (list ? list.map((v) => (v.collection_id === id ? { ...v, collection_id: null } : v)) : list))
    try { await collectionService.remove(id) } catch { /* erreur silencieuse */ }
  }

  const assignCollection = async (vetementId, collectionId) => {
    setCreations((list) => list.map((v) => (v.id === vetementId ? { ...v, collection_id: collectionId || null } : v)))
    try { await vetementService.setCollection(vetementId, collectionId) } catch { /* erreur silencieuse */ }
  }

  const moderateAvis = async (id, statut) => {
    setPendingAvis((l) => l.filter((a) => a.id !== id))
    try { await avisService.moderate(id, statut) } catch { /* erreur silencieuse */ }
  }

  const traiterDevis = async (id) => {
    setDevis((l) => l.map((d) => (d.id === id ? { ...d, statut: 'traite' } : d)))
    try { await devisService.traiter(id) } catch { /* erreur silencieuse */ }
  }


  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 pb-24 lg:pb-8">

        {/* En-tête */}
        <div className="pt-4 pb-3">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
            <Store size={15} /> Espace public
          </div>
          <h1 className="text-2xl font-bold font-display text-ink mt-1">Ma Vitrine</h1>
          <p className="text-sm text-dim mt-0.5">Votre présence sur la marketplace Gextimo.</p>
        </div>

        {/* Carte page publique */}
        <div className="rounded-2xl p-5 text-white bg-[#0D0D0D]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-white/60 text-xs">Votre page publique</p>
              <p className="font-bold font-display text-lg truncate">{atelier?.nom ?? 'Mon atelier'}</p>
              <p className="text-white/50 text-xs mt-0.5 truncate">{publicUrl}</p>
            </div>
            <span className="shrink-0 text-[11px] font-semibold px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
              ● En ligne
            </span>
          </div>
          <div className="flex gap-2 mt-4">
            {IS_NATIVE ? (
              <a href={publicUrl} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-600 transition">
                <ExternalLink size={16} /> Voir ma page
              </a>
            ) : (
              <Link to={publicPath}
                    className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-600 transition">
                <ExternalLink size={16} /> Voir ma page
              </Link>
            )}
            <button onClick={copyLink}
                    className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/10 transition">
              {copied ? <><Check size={16} /> Copié !</> : <><Copy size={16} /> Copier le lien</>}
            </button>
          </div>
          {/* Opt-in : exposer le contact WhatsApp sur la vitrine publique */}
          <button onClick={toggleContact} disabled={savingContact}
                  className="w-full flex items-center gap-3 mt-3 pt-3 border-t border-white/10 disabled:opacity-60">
            <MessageCircle size={16} className="text-white/60 shrink-0" />
            <span className="text-[13px] text-white/80 text-left flex-1">Afficher mon contact WhatsApp sur ma vitrine</span>
            <span className={cn('w-9 h-5 rounded-full relative transition shrink-0', contactPublic ? 'bg-primary' : 'bg-white/20')}>
              <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all', contactPublic ? 'left-[18px]' : 'left-0.5')} />
            </span>
          </button>
        </div>

        {/* KPIs réels */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <Kpi icon={Sparkles} label="Créations" value={nbCreations ?? '—'} hint={nbPubliees != null ? `${nbPubliees} publiée(s) sur la vitrine` : 'sur votre page'} />
          <Kpi icon={ClipboardList} label="Commandes en cours" value={dash.isLoading ? '—' : dash.en_cours} />
          <Kpi icon={Wallet} label="Encaissé ce mois" value={dash.isLoading ? '—' : formatCurrency(dash.total_encaisse)} />
        </div>

        {/* Profil public éditable */}
        <div className="mt-4 bg-card border border-edge rounded-xl p-4">
          <p className="text-sm font-semibold text-ink mb-3">Mon profil public</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-subtle flex items-center justify-center shrink-0">
              {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <Store size={20} className="text-ghost" />}
            </div>
            <label className="text-sm font-semibold text-primary cursor-pointer hover:underline">
              {uploadingLogo ? 'Envoi…' : 'Changer le logo / la photo'}
              <input type="file" accept="image/*" onChange={onLogoChange} disabled={uploadingLogo} className="hidden" />
            </label>
          </div>
          <label className="block text-xs font-medium text-dim mb-1">Spécialité</label>
          <input value={specialite} onChange={(e) => setSpecialite(e.target.value)} maxLength={120}
                 placeholder="Ex : Haute couture, Tailleur…"
                 className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <label className="block text-xs font-medium text-dim mb-1">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={1000}
                    placeholder="Présentez votre atelier en quelques mots…"
                    className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <label className="block text-xs font-medium text-dim mb-1 mt-3">Réseaux & site</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} maxLength={255} placeholder="Instagram (@ ou lien)" className="rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input value={facebook} onChange={(e) => setFacebook(e.target.value)} maxLength={255} placeholder="Facebook (lien)" className="rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input value={siteWeb} onChange={(e) => setSiteWeb(e.target.value)} maxLength={255} placeholder="Site web" className="rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <button type="button" onClick={useMyPosition} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            📍 Utiliser ma position {geoMsg && <span className="text-xs text-dim font-normal">{geoMsg}</span>}
          </button>
          <div className="flex items-center gap-3 mt-3">
            <button onClick={saveProfile} disabled={savingProfile}
                    className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-600 transition disabled:opacity-60">
              {savingProfile ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            {profileSaved && <span className="text-xs text-success font-medium">✓ Enregistré</span>}
          </div>
        </div>

        {/* Badge vérifié ou demande de vérification */}
        {atelier?.verifie ? (
          <div className="mt-4 bg-card border border-edge rounded-xl p-4 flex items-center gap-3">
            <ShieldCheck size={20} className="text-success shrink-0" />
            <div>
              <p className="text-sm font-semibold text-ink">Compte vérifié</p>
              <p className="text-xs text-dim">Le badge « Vérifié » est affiché sur votre vitrine publique.</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 bg-card border border-edge rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert size={17} className="text-warning shrink-0" />
              <p className="text-sm font-semibold text-ink">Demander la vérification</p>
            </div>
            <p className="text-xs text-dim mb-3">Joignez un document officiel (CNI, diplôme, certificat de créateur…) ou un lien vers votre portfolio / profil professionnel pour obtenir le badge « Vérifié ».</p>

            {verifSent ? (
              <p className="text-sm text-success font-medium">✓ Demande envoyée — nous vous répondons sous 48 h.</p>
            ) : (
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg border border-edge bg-subtle flex items-center justify-center shrink-0 group-hover:border-primary transition">
                    {verifDoc ? <Check size={14} className="text-success" /> : <Upload size={14} className="text-ghost" />}
                  </div>
                  <span className="text-xs text-dim group-hover:text-ink transition truncate">
                    {verifDoc ? verifDoc.name : 'Joindre un document (PDF, JPG, PNG)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setVerifDoc(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
                <div className="flex items-center gap-2">
                  <LinkIcon size={14} className="text-ghost shrink-0" />
                  <input
                    type="url"
                    value={verifLien}
                    onChange={(e) => setVerifLien(e.target.value)}
                    placeholder="Lien vers votre portfolio (https://…)"
                    className="flex-1 rounded-lg border border-edge bg-app px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button
                  onClick={submitVerification}
                  disabled={verifSending || (!verifDoc && !verifLien.trim())}
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-600 transition disabled:opacity-50"
                >
                  {verifSending ? 'Envoi…' : 'Envoyer la demande'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mise en avant sponsorisée */}
        {peutSponsoriser && (
        <div className="mt-4 bg-card border border-edge rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Star size={17} className={atelier?.sponsorise ? 'text-warning' : 'text-ghost'} />
            <p className="text-sm font-semibold text-ink">Mise en avant sponsorisée</p>
            {atelier?.sponsorise && (
              <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/25">
                Actif
              </span>
            )}
          </div>

          {atelier?.sponsorise ? (
            <p className="text-xs text-dim">Votre atelier est actuellement mis en avant en tête des résultats de recherche sur la vitrine.</p>
          ) : (
            <>
              <p className="text-xs text-dim mb-3">Apparaissez en premier sur la vitrine publique et augmentez votre visibilité auprès des clients.</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { jours: 7,  prix: 1500  },
                  { jours: 15, prix: 2500  },
                  { jours: 30, prix: 4500  },
                ].map(({ jours, prix }) => (
                  <button
                    key={jours}
                    onClick={() => setSponsoJours(jours)}
                    className={cn(
                      'flex flex-col items-center py-3 rounded-xl border text-sm font-semibold transition',
                      sponsoJours === jours
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-edge text-dim hover:border-primary hover:text-ink',
                    )}
                  >
                    <span className="font-bold">{jours} j</span>
                    <span className="text-[11px] font-normal mt-0.5">{prix.toLocaleString('fr-FR')} FCFA</span>
                  </button>
                ))}
              </div>
              <button
                onClick={acheterSponso}
                disabled={sponsoBusy}
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-600 transition disabled:opacity-60"
              >
                <Star size={15} />
                {sponsoBusy ? 'Redirection…' : `Sponsoriser ${sponsoJours} jours`}
              </button>
            </>
          )}
        </div>
        )}

        {/* Collections */}
        <div className="mt-4 bg-card border border-edge rounded-xl p-4">
          <p className="text-sm font-semibold text-ink mb-3">Mes collections</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {collections.length === 0 && <span className="text-xs text-ghost">Aucune collection pour le moment.</span>}
            {collections.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-subtle text-ink">
                {c.nom}{c.vetements_count != null && <span className="text-ghost">· {c.vetements_count}</span>}
                <button onClick={() => removeCollection(c.id)} className="text-ghost hover:text-danger" aria-label="Supprimer">✕</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newCollection} onChange={(e) => setNewCollection(e.target.value)} maxLength={120}
                   onKeyDown={(e) => { if (e.key === 'Enter') addCollection() }}
                   placeholder="Nouvelle collection…"
                   className="flex-1 rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={addCollection} className="text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-600 transition">Ajouter</button>
          </div>
        </div>

        {/* Avis à valider */}
        {pendingAvis.length > 0 && (
          <div className="mt-4 bg-card border border-edge rounded-xl p-4">
            <p className="text-sm font-semibold text-ink mb-3">Avis à valider <span className="text-primary">({pendingAvis.length})</span></p>
            <div className="space-y-3">
              {pendingAvis.map((a) => (
                <div key={a.id} className="border border-edge rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <b className="text-sm text-ink">{a.auteur_nom}{a.statut === 'signale' && <span className="text-[10px] font-bold text-danger ml-1.5">⚑ signalé</span>}</b>
                    <span className="text-primary text-xs">{'★'.repeat(a.note)}{'☆'.repeat(5 - a.note)}</span>
                  </div>
                  {a.texte && <p className="text-xs text-dim mt-1">{a.texte}</p>}
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => moderateAvis(a.id, 'valide')} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-600 transition">Valider</button>
                    <button onClick={() => moderateAvis(a.id, 'rejete')} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-edge text-dim hover:text-danger hover:border-danger transition">Rejeter</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demandes de devis reçues */}
        {devis.some((d) => d.statut === 'nouveau') && (
          <div className="mt-4 bg-card border border-edge rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList size={16} className="text-primary" />
              <p className="text-sm font-semibold text-ink">Demandes de devis <span className="text-primary">({devis.filter((d) => d.statut === 'nouveau').length})</span></p>
            </div>
            <div className="space-y-3">
              {devis.filter((d) => d.statut === 'nouveau').map((d) => (
                <div key={d.id} className="border border-edge rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <b className="text-sm text-ink">{d.nom}</b>
                    <span className="text-xs text-dim">{d.contact}</span>
                  </div>
                  {d.description && <p className="text-xs text-dim mt-1 whitespace-pre-line">{d.description}</p>}
                  {(d.budget || d.delai) && (
                    <div className="flex gap-3 mt-1.5 text-[11px] text-ghost">
                      {d.budget && <span>Budget : {d.budget} FCFA</span>}
                      {d.delai && <span>Délai : {d.delai}</span>}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => traiterDevis(d.id)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-600 transition">Marquer traité</button>
                    {d.contact && <a href={`https://wa.me/${d.contact.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-edge text-dim hover:text-primary hover:border-primary transition">Répondre</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistiques publiques (réelles) */}
        <div className="mt-4 bg-subtle border border-edge rounded-xl p-4">
          <p className="text-sm font-semibold text-ink mb-3">Statistiques publiques</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Eye, label: 'Visites', value: stats ? stats.visites.total : '—' },
              { icon: Store, label: 'Ce mois', value: stats ? stats.visites.mois : '—' },
              { icon: MessageCircle, label: 'Contacts', value: stats ? stats.contacts.total : '—' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <s.icon size={18} className="mx-auto text-primary" />
                <div className="text-lg font-bold text-ink mt-1">{s.value}</div>
                <div className="text-2xs text-dim">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Créations */}
        <div className="flex items-center justify-between mt-6 mb-3">
          <h2 className="text-lg font-bold font-display text-ink">Vos créations</h2>
          <Link to="/catalogue" className="text-sm font-semibold text-primary hover:underline">Gérer →</Link>
        </div>

        {creations === null ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        ) : creations.length === 0 ? (
          <div className="bg-card border border-edge rounded-xl p-8 text-center">
            <ImageIcon size={28} className="mx-auto text-ghost" />
            <p className="text-sm text-dim mt-2">Aucune création pour le moment.</p>
            <Link to="/catalogue" className="inline-flex mt-3 text-sm font-semibold text-primary hover:underline">Ajouter une création</Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {creations.map((v) => {
              const pub = isPublie(v)
              return (
                <div key={v.id} className="bg-card border border-edge rounded-xl overflow-hidden">
                  <div className="relative aspect-square bg-subtle flex items-center justify-center overflow-hidden">
                    {v.image_url
                      ? <img src={v.image_url} alt={v.nom} className={cn('w-full h-full object-cover transition', !pub && 'opacity-40 grayscale')} />
                      : <ImageIcon size={22} className="text-ghost" />}
                    <button
                      onClick={() => togglePublication(v)}
                      disabled={busy.has(v.id)}
                      title={pub ? 'Retirer de la vitrine' : 'Publier sur la vitrine'}
                      className={cn(
                        'absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center transition shadow-sm disabled:opacity-50',
                        pub ? 'bg-primary text-white' : 'bg-card text-ghost border border-edge',
                      )}
                    >
                      {pub ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-ink truncate">{v.nom}</p>
                    <p className={cn('text-[10px] font-semibold mt-0.5', pub ? 'text-primary' : 'text-ghost')}>
                      {pub ? 'Publié' : 'Masqué'}
                    </p>
                    {collections.length > 0 && (
                      <select value={v.collection_id || ''} onChange={(e) => assignCollection(v.id, e.target.value)}
                              className="mt-1.5 w-full text-[11px] rounded border border-edge bg-app px-1.5 py-1 text-dim focus:outline-none">
                        <option value="">— Collection</option>
                        {collections.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="text-2xs text-ghost mt-4 leading-relaxed">
          Touchez l'icône œil sur une création pour la <b className="text-dim">publier</b> ou la
          <b className="text-dim"> retirer</b> de votre page publique. Les statistiques de visites et
          de contacts arrivent prochainement.
        </p>
      </div>
    </AppLayout>
  )
}
