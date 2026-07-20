import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Store, ExternalLink, Copy, Check, Eye, EyeOff, MessageCircle,
  Sparkles, ClipboardList, Wallet, Image as ImageIcon,
  ShieldCheck, ShieldAlert, Upload, Link as LinkIcon,
  Star, Clock, BookOpen,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { exportLookbookPdf } from '@/utils/exportLookbookPdf'
import { useTranslation } from 'react-i18next'
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
import { abonnementService } from '@/services/abonnementService'
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
  const { t, i18n } = useTranslation()
  const { atelier, refreshAtelier } = useAuth()
  const { available: peutSponsoriser } = usePlanFeature('sponsorisation')
  const { available: peutLookbook } = usePlanFeature('lookbook_pdf')
  const [lookbookBusy, setLookbookBusy] = useState(false)
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
  const [banniereUrl, setBanniereUrl] = useState(() => atelier?.banniere_url || null)   // P134
  const [banniereType, setBanniereType] = useState(() => atelier?.banniere_type || null)
  const [uploadingBanniere, setUploadingBanniere] = useState(false)
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
  const [sponsoOffres, setSponsoOffres] = useState(null)

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
  // S08C-29 : les avis sont publiés directement ; seuls les avis SIGNALÉS
  // remontent ici, et en lecture seule — l'arbitrage appartient à l'admin.
  // Avis v2 : un avis signalé RESTE publié (statut `valide`) en attendant
  // l'arbitrage admin — le signalement se lit sur le compteur, plus sur le statut.
  useEffect(() => { avisService.getMine().then((d) => setPendingAvis((d || []).filter((a) => (a.signalements_count ?? 0) > 0 || a.revue_prioritaire))).catch(() => {}) }, [])
  useEffect(() => { devisService.getMine().then((d) => setDevis(d || [])).catch(() => {}) }, [])
  useEffect(() => {
    abonnementService.getSponsoOffres().then((d) => {
      setSponsoOffres(d)
      if (d?.offres?.length) setSponsoJours(d.offres[0].jours)
    }).catch(() => {})
  }, [])
  useEffect(() => { vitrineStatsService.getStats().then(setStats).catch(() => {}) }, [])
  // Rafraîchit l'atelier au montage : reflète immédiatement une sponsorisation
  // fraîchement payée (sponsorise + sponsor_jusqu_a) au retour de paiement.
  useEffect(() => { refreshAtelier?.().catch(() => {}) }, [refreshAtelier])

  const publicPath = atelier?.id ? `/createurs/${atelier.id}` : '/createurs'
  // Domaine public de la vitrine : sur l'app mobile, window.location.origin vaut
  // localhost/capacitor:// → on utilise le vrai domaine configuré (VITE_VITRINE_URL).
  const vitrineBase = import.meta.env.VITE_VITRINE_URL
    || (typeof window !== 'undefined' ? window.location.origin : '')
  const publicUrl = `${vitrineBase}${publicPath}`
  const nbCreations = creations?.length ?? null
  const nbPubliees = creations ? creations.filter(isPublie).length : null

  // PL-1 : lookbook PDF des créations publiées (plans payants).
  const handleLookbook = async () => {
    if (!peutLookbook) {
      toast(t('ma_vitrine.lookbook_upgrade'))
      return
    }
    const items = (creations ?? []).filter(isPublie)
    if (items.length === 0) {
      toast(t('ma_vitrine.lookbook_vide'))
      return
    }
    setLookbookBusy(true)
    try {
      await exportLookbookPdf({
        atelierNom: atelier?.nom ?? 'Gextimo',
        titre: t('ma_vitrine.lookbook_titre'),
        creations: items,
      })
    } catch {
      toast.error(t('ma_vitrine.lookbook_erreur'))
    } finally {
      setLookbookBusy(false)
    }
  }

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
      if (e?.response?.status === 403) alert(e.response.data?.message || t('ma_vitrine.limite_atteinte'))
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
          setGeoMsg(t('ma_vitrine.geo_enregistre'))
        } catch { setGeoMsg(t('ma_vitrine.geo_echec')) }
      },
      () => setGeoMsg(t('ma_vitrine.geo_refuse')),
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

  // P134 : bannière photo/GIF/vidéo.
  const onBanniereChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBanniere(true)
    try {
      const { banniere_url, banniere_type } = await parametresService.uploadAtelierBanniere(file)
      setBanniereUrl(banniere_url); setBanniereType(banniere_type)
    } catch { /* erreur silencieuse */ } finally {
      setUploadingBanniere(false)
      e.target.value = ''
    }
  }
  const onBanniereRemove = async () => {
    setUploadingBanniere(true)
    try {
      await parametresService.supprimerAtelierBanniere()
      setBanniereUrl(null); setBanniereType(null)
    } catch { /* erreur silencieuse */ } finally {
      setUploadingBanniere(false)
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

  const traiterDevis = async (id) => {
    setDevis((l) => l.map((d) => (d.id === id ? { ...d, statut: 'traite' } : d)))
    try { await devisService.traiter(id) } catch { /* erreur silencieuse */ }
  }

  const acheterSponso = async () => {
    if (sponsoBusy) return
    setSponsoBusy(true)
    try {
      const { checkout_url } = await abonnementService.acheterSponso({ jours: sponsoJours })
      if (checkout_url) window.location.href = checkout_url
    } catch { /* erreur silencieuse */ } finally {
      setSponsoBusy(false)
    }
  }

  const submitVerification = async () => {
    if (verifSending || (!verifDoc && !verifLien.trim())) return
    setVerifSending(true)
    try {
      await parametresService.demanderVerification({ fichier: verifDoc, lien: verifLien.trim() || null })
      setVerifSent(true)
    } catch { /* erreur silencieuse — le backend répondra quand l'endpoint sera disponible */ }
    finally { setVerifSending(false) }
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 pb-24 lg:pb-8">

        {/* En-tête */}
        <div className="pt-4 pb-3">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
            <Store size={15} /> {t('ma_vitrine.espace_public')}
          </div>
          <h1 className="text-2xl font-bold font-display text-ink mt-1">{t('ma_vitrine.titre')}</h1>
          <p className="text-sm text-dim mt-0.5">{t('ma_vitrine.sous_titre')}</p>
        </div>

        {/* Carte page publique */}
        <div className="rounded-2xl p-5 text-white bg-[#0D0D0D]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-white/60 text-xs">{t('ma_vitrine.page_publique')}</p>
              <p className="font-bold font-display text-lg truncate">{atelier?.nom ?? t('ma_vitrine.mon_atelier')}</p>
              <p className="text-white/50 text-xs mt-0.5 truncate">{publicUrl}</p>
            </div>
            <span className="shrink-0 text-[11px] font-semibold px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
              {t('ma_vitrine.en_ligne')}
            </span>
          </div>
          {/* Empilés sous 400 px : côte à côte, les libellés se brisaient en
              « Voir ma / page » et « Copier le / lien ». */}
          <div className="flex flex-col min-[400px]:flex-row gap-2 mt-4">
            {IS_NATIVE ? (
              <a href={publicUrl} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-600 transition whitespace-nowrap">
                <ExternalLink size={16} className="shrink-0" /> {t('ma_vitrine.voir_page')}
              </a>
            ) : (
              <Link to={publicPath}
                    className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-600 transition whitespace-nowrap">
                <ExternalLink size={16} className="shrink-0" /> {t('ma_vitrine.voir_page')}
              </Link>
            )}
            <button onClick={copyLink}
                    className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/10 transition whitespace-nowrap">
              {copied ? <><Check size={16} /> {t('ma_vitrine.copie')}</> : <><Copy size={16} /> {t('ma_vitrine.copier_lien')}</>}
            </button>
          </div>
          {/* Opt-in : exposer le contact WhatsApp sur la vitrine publique */}
          <button onClick={toggleContact} disabled={savingContact}
                  className="w-full flex items-center gap-3 mt-3 pt-3 border-t border-white/10 disabled:opacity-60">
            <MessageCircle size={16} className="text-white/60 shrink-0" />
            <span className="text-[13px] text-white/80 text-left flex-1">{t('ma_vitrine.afficher_whatsapp')}</span>
            <span className={cn('w-9 h-5 rounded-full relative transition shrink-0', contactPublic ? 'bg-primary' : 'bg-white/20')}>
              <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all', contactPublic ? 'left-[18px]' : 'left-0.5')} />
            </span>
          </button>
        </div>

        {/* Statistiques publiques (réelles) — en tête : performance de la vitrine */}
        <div className="mt-4 bg-subtle border border-edge rounded-xl p-4">
          <p className="text-sm font-semibold text-ink mb-3">{t('ma_vitrine.stats_titre')}</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Eye, label: t('ma_vitrine.visites'), value: stats ? stats.visites.total : '—' },
              { icon: Store, label: t('ma_vitrine.ce_mois'), value: stats ? stats.visites.mois : '—' },
              { icon: MessageCircle, label: t('ma_vitrine.contacts'), value: stats ? stats.contacts.total : '—' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <s.icon size={18} className="mx-auto text-primary" />
                <div className="text-lg font-bold text-ink mt-1">{s.value}</div>
                <div className="text-2xs text-dim">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* KPIs réels */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <Kpi icon={Sparkles} label={t('ma_vitrine.kpi_creations')} value={nbCreations ?? '—'} hint={nbPubliees != null ? t('ma_vitrine.kpi_publiees', { n: nbPubliees }) : t('ma_vitrine.kpi_sur_page')} />
          <Kpi icon={ClipboardList} label={t('ma_vitrine.kpi_commandes')} value={dash.isLoading ? '—' : dash.en_cours} />
          <Kpi icon={Wallet} label={t('ma_vitrine.kpi_encaisse')} value={dash.isLoading ? '—' : formatCurrency(dash.total_encaisse)} />
        </div>

        {/* Profil public éditable */}
        <div className="mt-4 bg-card border border-edge rounded-xl p-4">
          <p className="text-sm font-semibold text-ink mb-3">{t('ma_vitrine.mon_profil')}</p>

          {/* P134 : bannière de couverture (photo / GIF / vidéo) */}
          <div className="mb-4">
            <div className="relative h-24 rounded-lg overflow-hidden bg-subtle border border-edge">
              {banniereUrl ? (
                banniereType === 'video'
                  ? <video src={banniereUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                  : <img src={banniereUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ghost text-xs">{t('ma_vitrine.banniere_vide')}</div>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <label className="text-xs font-semibold text-primary cursor-pointer hover:underline">
                {uploadingBanniere ? t('ma_vitrine.envoi') : t('ma_vitrine.changer_banniere')}
                <input type="file" accept="image/*,video/mp4,video/webm" onChange={onBanniereChange} disabled={uploadingBanniere} className="hidden" />
              </label>
              {banniereUrl && <button type="button" onClick={onBanniereRemove} disabled={uploadingBanniere} className="text-xs text-error hover:opacity-80">{t('ma_vitrine.retirer_banniere')}</button>}
            </div>
            <p className="text-[11px] text-ghost mt-1">{t('ma_vitrine.banniere_hint')}</p>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-subtle flex items-center justify-center shrink-0">
              {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <Store size={20} className="text-ghost" />}
            </div>
            <label className="text-sm font-semibold text-primary cursor-pointer hover:underline">
              {uploadingLogo ? t('ma_vitrine.envoi') : t('ma_vitrine.changer_logo')}
              <input type="file" accept="image/*" onChange={onLogoChange} disabled={uploadingLogo} className="hidden" />
            </label>
          </div>
          <label className="block text-xs font-medium text-dim mb-1">{t('ma_vitrine.specialite')}</label>
          <input value={specialite} onChange={(e) => setSpecialite(e.target.value)} maxLength={120}
                 placeholder={t('ma_vitrine.specialite_ph')}
                 className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <label className="block text-xs font-medium text-dim mb-1">{t('ma_vitrine.bio')}</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={1000}
                    placeholder={t('ma_vitrine.bio_ph')}
                    className="w-full rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <label className="block text-xs font-medium text-dim mb-1 mt-3">{t('ma_vitrine.reseaux')}</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} maxLength={255} placeholder={t('ma_vitrine.instagram_ph')} className="rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input value={facebook} onChange={(e) => setFacebook(e.target.value)} maxLength={255} placeholder={t('ma_vitrine.facebook_ph')} className="rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input value={siteWeb} onChange={(e) => setSiteWeb(e.target.value)} maxLength={255} placeholder={t('ma_vitrine.site_ph')} className="rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <button type="button" onClick={useMyPosition} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            📍 {t('ma_vitrine.utiliser_position')} {geoMsg && <span className="text-xs text-dim font-normal">{geoMsg}</span>}
          </button>
          <div className="flex items-center gap-3 mt-3">
            <button onClick={saveProfile} disabled={savingProfile}
                    className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-600 transition disabled:opacity-60">
              {savingProfile ? t('ma_vitrine.enregistrement') : t('commun.enregistrer')}
            </button>
            {profileSaved && <span className="text-xs text-success font-medium">{t('ma_vitrine.enregistre')}</span>}
          </div>
        </div>

        {/* Badge vérifié ou demande de vérification */}
        {atelier?.verifie ? (
          <div className="mt-4 bg-card border border-edge rounded-xl p-4 flex items-center gap-3">
            <ShieldCheck size={20} className="text-success shrink-0" />
            <div>
              <p className="text-sm font-semibold text-ink">{t('ma_vitrine.compte_verifie')}</p>
              <p className="text-xs text-dim">{t('ma_vitrine.verifie_desc')}</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 bg-card border border-edge rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert size={17} className="text-warning shrink-0" />
              <p className="text-sm font-semibold text-ink">{t('ma_vitrine.demander_verif')}</p>
            </div>
            <p className="text-xs text-dim mb-3">{t('ma_vitrine.verif_desc')}</p>

            {(verifSent || atelier?.verification_demandee_a) ? (
              <p className="text-sm text-success font-medium">{t('ma_vitrine.verif_envoyee')}</p>
            ) : (
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg border border-edge bg-subtle flex items-center justify-center shrink-0 group-hover:border-primary transition">
                    {verifDoc ? <Check size={14} className="text-success" /> : <Upload size={14} className="text-ghost" />}
                  </div>
                  <span className="text-xs text-dim group-hover:text-ink transition truncate">
                    {verifDoc ? verifDoc.name : t('ma_vitrine.joindre_doc')}
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
                    placeholder={t('ma_vitrine.portfolio_ph')}
                    className="flex-1 rounded-lg border border-edge bg-app px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button
                  onClick={submitVerification}
                  disabled={verifSending || (!verifDoc && !verifLien.trim())}
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-600 transition disabled:opacity-50"
                >
                  {verifSending ? t('ma_vitrine.envoi') : t('ma_vitrine.envoyer_demande')}
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
            <p className="text-sm font-semibold text-ink">{t('ma_vitrine.sponso_titre')}</p>
            {atelier?.sponsorise && (
              <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/25">
                {t('ma_vitrine.actif')}
              </span>
            )}
          </div>

          {atelier?.sponsorise ? (
            <>
              <p className="text-xs text-dim">{t('ma_vitrine.sponso_actif_desc')}</p>
              {atelier?.sponsor_jusqu_a && (() => {
                const fin = new Date(atelier.sponsor_jusqu_a)
                const jours = Math.max(0, Math.ceil((fin.getTime() - Date.now()) / 86400000))
                const dateStr = fin.toLocaleDateString(i18n.language === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                return (
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-warning/10 border border-warning/25 px-3 py-3">
                    <Clock size={20} className="text-warning shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink">{t(jours <= 1 ? 'ma_vitrine.sponso_jour_restant' : 'ma_vitrine.sponso_jours_restants', { n: jours })}</p>
                      <p className="text-[11px] text-dim mt-0.5">{t('ma_vitrine.sponso_fin_le', { date: dateStr })}</p>
                    </div>
                  </div>
                )
              })()}
            </>
          ) : sponsoOffres && !sponsoOffres.actif ? (
            <p className="text-xs text-dim">{t('ma_vitrine.sponso_indispo')}</p>
          ) : (
            <>
              <p className="text-xs text-dim mb-3">{t('ma_vitrine.sponso_desc')}</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {(sponsoOffres?.offres ?? []).map(({ jours, prix }) => (
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
                    <span className="font-bold">{t('ma_vitrine.jours', { n: jours })}</span>
                    <span className="text-[11px] font-normal mt-0.5">{Number(prix).toLocaleString('fr-FR')} {t('ma_vitrine.fcfa')}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={acheterSponso}
                disabled={sponsoBusy || !sponsoOffres?.offres?.length}
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-600 transition disabled:opacity-60"
              >
                <Star size={15} />
                {sponsoBusy ? t('ma_vitrine.redirection') : t('ma_vitrine.sponsoriser_n', { n: sponsoJours, count: sponsoJours })}
              </button>
            </>
          )}
        </div>
        )}

        {/* Collections */}
        <div className="mt-4 bg-card border border-edge rounded-xl p-4">
          <p className="text-sm font-semibold text-ink mb-3">{t('ma_vitrine.mes_collections')}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {collections.length === 0 && <span className="text-xs text-ghost">{t('ma_vitrine.aucune_collection')}</span>}
            {collections.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-subtle text-ink">
                {c.nom}{c.vetements_count != null && <span className="text-ghost">· {c.vetements_count}</span>}
                <button onClick={() => removeCollection(c.id)} className="text-ghost hover:text-danger" aria-label={t('commun.supprimer')}>✕</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newCollection} onChange={(e) => setNewCollection(e.target.value)} maxLength={120}
                   onKeyDown={(e) => { if (e.key === 'Enter') addCollection() }}
                   placeholder={t('ma_vitrine.nouvelle_collection_ph')}
                   className="flex-1 rounded-lg border border-edge bg-app px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={addCollection} className="text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-600 transition">{t('commun.ajouter')}</button>
          </div>
        </div>

        {/* Avis à valider */}
        {pendingAvis.length > 0 && (
          <div className="mt-4 bg-card border border-edge rounded-xl p-4">
            <p className="text-sm font-semibold text-ink">{t('ma_vitrine.avis_titre')} <span className="text-primary">({pendingAvis.length})</span></p>
            <div className="flex items-start gap-2 mt-2 mb-3">
              <ShieldAlert size={13} className="text-ghost mt-0.5 shrink-0" />
              <p className="text-xs text-ghost">{t('ma_vitrine.avis_examen')}</p>
            </div>
            <div className="space-y-3">
              {pendingAvis.map((a) => (
                <div key={a.id} className="border border-edge rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <b className="text-sm text-ink">{a.auteur_nom}</b>
                    <span className="text-primary text-xs">{'★'.repeat(a.note)}{'☆'.repeat(5 - a.note)}</span>
                  </div>
                  {a.texte && <p className="text-xs text-dim mt-1">{a.texte}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demandes de devis reçues — toujours visible (repère) + état vide + historique */}
        <div className="mt-4 bg-card border border-edge rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList size={16} className="text-primary" />
            <p className="text-sm font-semibold text-ink">
              {t('ma_vitrine.devis_titre')}
              {devis.filter((d) => d.statut === 'nouveau').length > 0 && (
                <span className="text-primary"> ({devis.filter((d) => d.statut === 'nouveau').length})</span>
              )}
            </p>
          </div>
          {devis.length === 0 ? (
            <p className="text-xs text-dim">{t('ma_vitrine.devis_vide')}</p>
          ) : (
            <div className="space-y-3">
              {devis.map((d) => (
                <div key={d.id} className={`border border-edge rounded-lg p-3 ${d.statut === 'traite' ? 'opacity-60' : ''}`}>
                  <div className="flex items-center justify-between">
                    <b className="text-sm text-ink">{d.nom}</b>
                    <span className="text-xs text-dim">{d.contact}</span>
                  </div>
                  {d.description && <p className="text-xs text-dim mt-1 whitespace-pre-line">{d.description}</p>}
                  {(d.budget || d.delai) && (
                    <div className="flex gap-3 mt-1.5 text-[11px] text-ghost">
                      {d.budget && <span>{t('ma_vitrine.budget')} {d.budget} {t('ma_vitrine.fcfa')}</span>}
                      {d.delai && <span>{t('ma_vitrine.delai')} {d.delai}</span>}
                    </div>
                  )}
                  {d.statut === 'nouveau' ? (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => traiterDevis(d.id)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-600 transition">{t('ma_vitrine.marquer_traite')}</button>
                      {d.contact && <a href={`https://wa.me/${d.contact.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-edge text-dim hover:text-primary hover:border-primary transition">{t('ma_vitrine.repondre')}</a>}
                    </div>
                  ) : (
                    <span className="inline-block mt-2 text-[11px] font-medium text-success">{t('ma_vitrine.devis_traite')}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Créations */}
        <div className="flex items-center justify-between mt-6 mb-3">
          <h2 className="text-lg font-bold font-display text-ink">{t('ma_vitrine.vos_creations')}</h2>
          <div className="flex items-center gap-3">
            {/* PL-1 : lookbook PDF (plans payants) */}
            {creations?.length > 0 && (
              <button
                onClick={handleLookbook}
                disabled={lookbookBusy}
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <BookOpen size={14} /> {lookbookBusy ? t('ma_vitrine.lookbook_encours') : t('ma_vitrine.lookbook')}
              </button>
            )}
            <Link to="/catalogue" className="text-sm font-semibold text-primary hover:underline">{t('ma_vitrine.gerer')}</Link>
          </div>
        </div>

        {creations === null ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        ) : creations.length === 0 ? (
          <div className="bg-card border border-edge rounded-xl p-8 text-center">
            <ImageIcon size={28} className="mx-auto text-ghost" />
            <p className="text-sm text-dim mt-2">{t('ma_vitrine.aucune_creation')}</p>
            <Link to="/catalogue" className="inline-flex mt-3 text-sm font-semibold text-primary hover:underline">{t('ma_vitrine.ajouter_creation')}</Link>
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
                      title={pub ? t('ma_vitrine.retirer_vitrine') : t('ma_vitrine.publier_vitrine')}
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
                      {pub ? t('ma_vitrine.publie') : t('ma_vitrine.masque')}
                    </p>
                    {collections.length > 0 && (
                      <select value={v.collection_id || ''} onChange={(e) => assignCollection(v.id, e.target.value)}
                              className="mt-1.5 w-full text-[11px] rounded border border-edge bg-app px-1.5 py-1 text-dim focus:outline-none">
                        <option value="">{t('ma_vitrine.collection_opt')}</option>
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
          {t('ma_vitrine.aide')}
        </p>
      </div>
    </AppLayout>
  )
}
