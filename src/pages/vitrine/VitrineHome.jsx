import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Heart, Search, Star, MapPin, Check, Scissors, ShieldCheck, Headphones, Sparkles as SparklesIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import VitrineShell from './VitrineChrome'
import PartenairesBanner from './PartenairesBanner'
import { getCreators, getCreations, demoModels, categories } from './vitrineApi'
import GarmentVisual from './GarmentVisual'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useDevise } from './vitrineCurrency'
import { useFavoris } from './useFavoris'
import { SkeletonCreatorCard, SkeletonGalleryCard } from './VitrineSkeletons'
import BandeAnnonces from '@/components/layout/BandeAnnonces'

const btnPrimary = 'vt-btn-primary inline-flex items-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl bg-primary text-inverse hover:bg-primary-600'
const btnOutline = 'vt-btn-ghost inline-flex items-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl border border-edge text-ink hover:border-primary hover:text-primary'

/* Strip de confiance — 4 arguments sous le hero (VIT-2). */
function TrustStrip() {
  const { t } = useTranslation()
  const items = [
    { Icon: ShieldCheck,   key: 'item_1' },
    { Icon: Check,         key: 'item_2' },
    { Icon: Headphones,    key: 'item_3' },
    { Icon: SparklesIcon,  key: 'item_4' },
  ]
  return (
    <div className="border-y border-edge py-3 bg-subtle">
      <div className="max-w-[1180px] mx-auto px-5 flex flex-wrap justify-center gap-x-8 gap-y-2">
        {items.map(({ Icon, key }) => (
          <div key={key} className="flex items-center gap-2 text-[13px] text-dim">
            <Icon size={14} className="text-primary shrink-0" />
            <span>{t(`vitrine.trust.${key}`)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* Section « Par où commencer ? » — onboarding client / créateur (VIT-1). */
function OnboardingSection() {
  const { t } = useTranslation()
  return (
    <section className="py-14 px-5">
      <div className="max-w-[1180px] mx-auto">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.14em] text-primary mb-8">
          {t('vitrine.onboarding.label')}
        </p>
        <div className="vt-stagger grid md:grid-cols-2 gap-6 max-w-[820px] mx-auto">
          {/* Créateur */}
          <div className="vt-item border border-edge rounded-2xl p-7 flex flex-col gap-4 hover:border-primary/40 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <Scissors size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-[18px] text-ink">{t('vitrine.onboarding.creator_title')}</h3>
              <p className="text-dim text-sm mt-1.5 leading-relaxed">{t('vitrine.onboarding.creator_desc')}</p>
            </div>
            <Link to="/inscription"
              className="mt-auto inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl bg-primary text-inverse hover:bg-primary-600 transition w-fit">
              {t('vitrine.onboarding.creator_cta')}
            </Link>
          </div>
          {/* Client */}
          <div className="vt-item border border-edge rounded-2xl p-7 flex flex-col gap-4 hover:border-primary/40 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-primary/5 flex items-center justify-center">
              <Search size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-[18px] text-ink">{t('vitrine.onboarding.client_title')}</h3>
              <p className="text-dim text-sm mt-1.5 leading-relaxed">{t('vitrine.onboarding.client_desc')}</p>
            </div>
            <Link to="/createurs"
              className="mt-auto inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl border border-primary text-primary hover:bg-primary/5 transition w-fit">
              {t('vitrine.onboarding.client_cta')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroSearch({ creators }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()
  const list = creators || []
  const cM = query ? list.filter((c) => `${c.nom} ${c.specialite} ${c.ville}`.toLowerCase().includes(query)).slice(0, 4) : []
  const mM = query ? demoModels.filter((m) => `${m.nom} ${m.par}`.toLowerCase().includes(query)).slice(0, 4) : []
  const idByNom = (nom) => list.find((c) => c.nom === nom)?.id
  const has = cM.length || mM.length

  const handleSearch = () => {
    const dest = q.trim() ? `/createurs?q=${encodeURIComponent(q.trim())}` : '/createurs'
    navigate(dest)
    setQ('')
  }

  return (
    <div className="relative max-w-[540px] mx-auto mb-6 text-left">
      <div className="flex items-center rounded-xl border border-edge bg-card focus-within:ring-2 focus-within:ring-primary/30 overflow-hidden">
        <Search size={15} className="ml-3.5 shrink-0 text-ghost pointer-events-none" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={t('vitrine.search.placeholder')}
          className="flex-1 px-3 py-3 text-sm text-ink placeholder:text-ghost bg-transparent focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="m-1.5 shrink-0 px-4 py-2 rounded-[10px] bg-primary text-inverse font-semibold text-sm hover:bg-primary-600 transition whitespace-nowrap"
        >
          {t('vitrine.search.cta')}
        </button>
      </div>
      {query && (
        <div className="absolute inset-x-0 top-full mt-2 bg-card border border-edge rounded-xl shadow-lg overflow-hidden z-30">
          {!has && <div className="px-4 py-3 text-sm text-dim">{t('vitrine.search.empty')}</div>}
          {cM.length > 0 && (
            <div className="py-1">
              <div className="px-4 pt-2 pb-1 text-2xs font-bold uppercase tracking-wider text-ghost">{t('vitrine.search.creators')}</div>
              {cM.map((c) => (
                <Link key={c.id} to={`/createurs/${c.id}`} onClick={() => setQ('')}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-subtle transition">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-inverse shrink-0" style={{ background: c.gradient }}>{c.initiales}</span>
                  <span className="text-sm text-ink">{c.nom}</span>
                  <span className="text-xs text-ghost ml-auto">{c.specialite}</span>
                </Link>
              ))}
            </div>
          )}
          {mM.length > 0 && (
            <div className="py-1 border-t border-edge">
              <div className="px-4 pt-2 pb-1 text-2xs font-bold uppercase tracking-wider text-ghost">{t('vitrine.search.models')}</div>
              {mM.map((m) => {
                const id = idByNom(m.par)
                return (
                  <Link key={m.id} to={id ? `/createurs/${id}` : '/#gallery'} onClick={() => setQ('')}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-subtle transition">
                    <span className="text-sm text-ink">{m.nom}</span>
                    <span className="text-xs text-ghost ml-auto">{m.par}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SectionHead({ eyebrow, title, subtitle }) {
  return (
    <div className="vt-reveal max-w-[620px] mx-auto mb-9 text-center">
      {eyebrow && <div className="text-[12px] font-bold tracking-[0.14em] uppercase text-primary">{eyebrow}</div>}
      <h2 className="font-display text-[clamp(26px,3.4vw,38px)] mt-2.5 mb-2 text-ink">{title}</h2>
      {subtitle && <p className="text-dim">{subtitle}</p>}
    </div>
  )
}

export default function VitrineHome() {
  const { t } = useTranslation()
  const { format } = useDevise()
  const { has, toggle } = useFavoris()
  const [rot, setRot] = useState(0)
  usePageMeta({ path: '/' })
  const [creators, setCreators] = useState(null)
  const [cat, setCat] = useState('all')
  const [galleryModels, setGalleryModels] = useState(null)
  const location = useLocation()
  const carouselRef = useRef(null)
  const [carouselEdge, setCarouselEdge] = useState({ left: false, right: false })

  const checkCarouselEdge = () => {
    const el = carouselRef.current
    if (!el) return
    setCarouselEdge({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 })
  }
  const scrollCarousel = (dir) => carouselRef.current?.scrollBy({ left: dir * 290, behavior: 'smooth' })

  const rotations = t('vitrine.rotations', { returnObjects: true })
  const steps = t('vitrine.how.steps', { returnObjects: true })

  useEffect(() => {
    const id = setInterval(() => setRot((v) => v + 1), 2600)
    return () => clearInterval(id)
  }, [])
  useEffect(() => { getCreators().then(setCreators) }, [])
  useEffect(() => { getCreations().then(setGalleryModels) }, [])
  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    checkCarouselEdge()
    el.addEventListener('scroll', checkCarouselEdge, { passive: true })
    return () => el.removeEventListener('scroll', checkCarouselEdge)
  }, [creators])

  useEffect(() => {
    const s = Object.assign(document.createElement('script'), { type: 'application/ld+json', id: 'gx-home-ld' })
    s.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Gextimo',
      url: window.location.origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${window.location.origin}/createurs?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    })
    document.head.appendChild(s)
    return () => { document.getElementById('gx-home-ld')?.remove() }
  }, [])

  useEffect(() => {
    if (!location.hash) return
    // Déclenché uniquement sur changement de hash (pas sur chargement des données)
    // Le timeout laisse le temps au layout de s'établir avant de scroller
    const tid = setTimeout(() => {
      const el = document.querySelector(location.hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 80)
    return () => clearTimeout(tid)
  }, [location.hash])

  const models = galleryModels
    ? (cat === 'all' ? galleryModels : galleryModels.filter((m) => m.cat === cat))
    : null
  const creatorSlugByName = creators
    ? Object.fromEntries(creators.map((c) => [c.nom, c.id]))
    : {}
  const rotMsg = Array.isArray(rotations) && rotations.length ? rotations[rot % rotations.length] : ''
  const prm = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <VitrineShell>
      {/* ANN-8 — annonces des créateurs, EN HAUT DE LA VITRINE.
          Elles n'étaient affichées que dans le tableau de bord PRO : un
          créateur payait un Boost pour être vu… par ses concurrents dans leur
          espace de travail, et jamais par le public censé acheter chez lui.
          La visibilité vendue se joue ici. */}
      <BandeAnnonces />

      {/* HERO */}
      <section className="relative overflow-hidden min-h-[calc(100dvh-6.5rem)] flex flex-col items-center justify-center pt-10 pb-10 text-center isolate">
        {/* ── Fond animé multicouche — ambiance défilé ── */}
        <div className="vt-hero-bg" aria-hidden="true">

          {/* Couche 1 — Rubans de soie (SMIL) */}
          <svg className="vt-hero-ribbons" viewBox="0 0 1220 640" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="vt-sg1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="var(--color-primary-700)" stopOpacity="0" />
                <stop offset="28%"  stopColor="var(--color-primary)" stopOpacity="0.9" />
                <stop offset="48%"  stopColor="var(--color-primary-400)" stopOpacity="0.95" />
                <stop offset="70%"  stopColor="var(--color-primary-700)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="var(--color-primary-700)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="vt-sg2" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%"   stopColor="var(--color-gold-dark)" stopOpacity="0" />
                <stop offset="40%"  stopColor="var(--color-gold-hi)" stopOpacity="0.9" />
                <stop offset="55%"  stopColor="var(--color-gold-hi)" stopOpacity="1" />
                <stop offset="72%"  stopColor="var(--color-gold)" stopOpacity="0.75" />
                <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="vt-sg3" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="var(--color-primary-400)" stopOpacity="0" />
                <stop offset="50%"  stopColor="var(--color-primary-300)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="var(--color-primary-400)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="vt-sheen" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="var(--color-gold-hi)" stopOpacity="0" />
                <stop offset="50%"  stopColor="var(--color-gold-hi)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="var(--color-gold-hi)" stopOpacity="0" />
              </linearGradient>
              <filter id="vt-soft"><feGaussianBlur stdDeviation="1" /></filter>
            </defs>

            {/* Ruban rouge large — bande haute, gauche → droite, 28 s */}
            <path fill="url(#vt-sg1)" filter="url(#vt-soft)" opacity="0.65"
              d="M-100,70 C160,10 380,150 630,95 S 980,15 1360,120 L1360,250 C980,150 720,235 630,225 S 350,275 -100,200 Z">
              {!prm && <animate attributeName="d" dur="28s" calcMode="spline" keyTimes="0;0.5;1" keySplines=".45,0,.55,1;.45,0,.55,1" repeatCount="indefinite"
                values="M-100,70 C160,10 380,150 630,95 S 980,15 1360,120 L1360,250 C980,150 720,235 630,225 S 350,275 -100,200 Z;M-100,110 C180,190 400,60 630,150 S 1000,210 1360,80 L1360,210 C1000,300 700,170 630,190 S 340,80 -100,150 Z;M-100,70 C160,10 380,150 630,95 S 980,15 1360,120 L1360,250 C980,150 720,235 630,225 S 350,275 -100,200 Z" />}
            </path>

            {/* Reflet satiné — fil de lumière sur le pli rouge */}
            <path fill="none" stroke="url(#vt-sheen)" strokeWidth="1.4" opacity="0.55" style={{ mixBlendMode: 'screen' }}
              d="M-100,135 C160,80 380,220 630,160 S 980,90 1360,185">
              {!prm && <animate attributeName="d" dur="28s" calcMode="spline" keyTimes="0;0.5;1" keySplines=".45,0,.55,1;.45,0,.55,1" repeatCount="indefinite"
                values="M-100,135 C160,80 380,220 630,160 S 980,90 1360,185;M-100,180 C180,275 400,130 630,220 S 1000,285 1360,145;M-100,135 C160,80 380,220 630,160 S 980,90 1360,185" />}
            </path>

            {/* Ruban or moyen — bande basse, 36 s */}
            <path fill="url(#vt-sg2)" filter="url(#vt-soft)" opacity="0.45" style={{ mixBlendMode: 'screen' }}
              d="M-100,420 C220,470 430,330 700,400 S 1040,480 1360,380 L1360,470 C1040,560 750,490 700,500 S 260,600 -100,520 Z">
              {!prm && <animate attributeName="d" dur="36s" calcMode="spline" keyTimes="0;0.5;1" keySplines=".45,0,.55,1;.45,0,.55,1" repeatCount="indefinite"
                values="M-100,420 C220,470 430,330 700,400 S 1040,480 1360,380 L1360,470 C1040,560 750,490 700,500 S 260,600 -100,520 Z;M-100,470 C240,360 420,520 700,440 S 1020,360 1360,500 L1360,590 C1020,480 760,570 700,560 S 300,470 -100,600 Z;M-100,420 C220,470 430,330 700,400 S 1040,480 1360,380 L1360,470 C1040,560 750,490 700,500 S 260,600 -100,520 Z" />}
            </path>

            {/* Ruban rouge fin — accent central, 20 s */}
            <path fill="url(#vt-sg3)" filter="url(#vt-soft)" opacity="0.30"
              d="M-100,260 C200,230 420,310 660,260 S 1000,220 1360,280 L1360,320 C1000,270 680,300 660,300 S 240,270 -100,300 Z">
              {!prm && <animate attributeName="d" dur="20s" calcMode="spline" keyTimes="0;0.5;1" keySplines=".45,0,.55,1;.45,0,.55,1" repeatCount="indefinite"
                values="M-100,260 C200,230 420,310 660,260 S 1000,220 1360,280 L1360,320 C1000,270 680,300 660,300 S 240,270 -100,300 Z;M-100,300 C220,300 400,240 660,300 S 980,300 1360,240 L1360,285 C980,340 700,280 660,340 S 260,335 -100,340 Z;M-100,260 C200,230 420,310 660,260 S 1000,220 1360,280 L1360,320 C1000,270 680,300 660,300 S 240,270 -100,300 Z" />}
            </path>
          </svg>

          {/* Couche 3 — Faisceau de podium */}
          <div className="vt-hero-podium" />

          {/* Couche 4 — Lueurs radiales pulsantes */}
          <div className="vt-hero-glows" />

          {/* Couche 5 — Reflet de défilé */}
          <div className="vt-hero-shimmer" />

          {/* Couche 6 — Grain film statique */}
          <div className="vt-hero-grain" />

          {/* Couche 7 — Voile lamé : micro-points or screen */}
          <div className="vt-hero-lame" />
        </div>

        <div className="vt-stagger max-w-[1180px] mx-auto px-5 relative">
          <div className="vt-item text-[12px] font-bold tracking-[0.14em] uppercase text-primary">{t('vitrine.hero.eyebrow')}</div>
          <h1 className="vt-item font-display font-extrabold mx-auto max-w-[880px] my-3.5 text-[clamp(34px,6vw,60px)] leading-[1.08] text-ink">
            {t('vitrine.hero.title_pre')}<span className="text-primary">{t('vitrine.hero.title_hl')}</span>{t('vitrine.hero.title_post')}
          </h1>
          <div className="vt-item h-7 mb-6 text-dim text-[clamp(15px,2vw,19px)] font-medium">
            <b key={rot} className="vt-rotmsg text-ink font-semibold">{rotMsg}</b>
          </div>
          <div className="vt-item">
            <HeroSearch creators={creators} />
          </div>
          <div className="vt-item flex gap-3 justify-center flex-wrap mb-5">
            <a href="#creators" className={btnPrimary}>{t('vitrine.hero.cta_discover')}</a>
            <a href="#how" className={btnOutline}>{t('vitrine.hero.cta_how')}</a>
          </div>
          <div className="vt-item flex gap-6 justify-center flex-wrap text-dim text-sm">
            <span><b className="text-ink font-bold tabular-nums">{creators ? creators.length.toLocaleString('fr-FR') : '…'}</b> {t('vitrine.hero.stat_creators')}</span>
            <span><b className="text-ink font-bold tabular-nums">{creators ? creators.filter(c => c.verifie).length : '…'}</b> {t('vitrine.hero.stat_designers')}</span>
            <span><b className="text-ink font-bold tabular-nums">{creators ? new Set(creators.map(c => c.ville)).size : '…'}</b> {t('vitrine.hero.stat_cities')}</span>
          </div>
        </div>
      </section>

      {/* Strip confiance — juste sous le hero (VIT-2) */}
      <TrustStrip />

      {/* ONBOARDING client / créateur (VIT-1) */}
      <OnboardingSection />

      {/* COMMENT ÇA MARCHE */}
      <section id="how" className="py-16 scroll-mt-[76px]">
        <div className="max-w-[1180px] mx-auto px-5">
          <SectionHead eyebrow={t('vitrine.how.eyebrow')} title={t('vitrine.how.title')} subtitle={t('vitrine.how.subtitle')} />
          <div className="vt-stagger grid grid-cols-1 md:grid-cols-3 gap-5">
            {(Array.isArray(steps) ? steps : []).map((s) => (
              <div key={s.n} className="vt-item vt-card bg-card border border-edge rounded-lg p-7 text-center">
                <div className="text-[12px] font-bold text-primary tracking-[0.1em]">{s.n}</div>
                <h3 className="font-display text-xl my-1.5 text-ink">{s.t}</h3>
                <p className="text-dim text-sm">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* P204 — Bandeau partenaires (défilement auto + accès /partenaires) */}
      <PartenairesBanner />

      {/* CRÉATEURS */}
      <section id="creators" className="py-16 bg-elevated scroll-mt-[76px]">
        <div className="max-w-[1180px] mx-auto px-5">
          <SectionHead eyebrow={t('vitrine.creators.eyebrow')} title={t('vitrine.creators.title')} subtitle={t('vitrine.creators.subtitle')} />
          <div className="relative">
            <div ref={carouselRef} className="vt-stagger vt-carousel flex gap-4 overflow-x-auto">
              {(creators || []).map((c) => (
                <Link key={c.id} to={`/createurs/${c.id}`}
                      className="vt-item vt-card relative min-w-[268px] max-w-[268px] bg-card border border-edge rounded-lg p-5">
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(c.id) }} className="absolute top-3 right-3 z-10" aria-label={t('vitrine.a11y.favori')} aria-pressed={has(c.id)}>
                    <Heart size={16} className={has(c.id) ? 'text-primary' : 'text-ghost'} fill={has(c.id) ? 'currentColor' : 'none'} />
                  </button>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-[50px] h-[50px] rounded-xl overflow-hidden flex items-center justify-center font-display font-bold text-lg text-inverse shrink-0" style={c.logo_url ? undefined : { background: c.gradient }}>{c.logo_url ? <img src={c.logo_url} alt={c.nom} className="w-full h-full object-cover" loading="lazy" /> : c.initiales}</div>
                    <div>
                      <h4 className="font-bold text-[15.5px] text-ink flex items-center gap-1.5">
                        {c.nom}
                        {c.verifie && <span className="text-[10.5px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{t('vitrine.creators.verified')}</span>}
                        {c.sponsorise && <span title={t('vitrine.a11y.sponsorise')} className="inline-flex items-center text-inverse bg-primary px-1.5 py-0.5 rounded-full"><Star size={10} className="fill-current" aria-hidden="true" /></span>}
                      </h4>
                      <div className="text-[12.5px] text-dim">{c.specialite}</div>
                    </div>
                  </div>
                  <div className="text-[13px] text-dim mb-3.5">
                    {c.note ? <span className="text-primary font-bold inline-flex items-center gap-1"><Star size={12} className="fill-current" aria-hidden="true" />{c.note}</span> : <span className="text-ghost">{t('vitrine.creators.new')}</span>}
                    {' · '}<MapPin size={12} className="inline-block align-[-0.1em] mr-1" aria-hidden="true" />{c.ville}
                  </div>
                  <span className={btnOutline + ' w-full justify-center !py-2 text-[13px]'}>{t('vitrine.creators.visit')}</span>
                </Link>
              ))}
              {!creators && Array.from({ length: 4 }, (_, i) => (
                <SkeletonCreatorCard key={i} className="min-w-[268px] max-w-[268px] shrink-0" />
              ))}
            </div>
            {/* Flèche gauche */}
            <button onClick={() => scrollCarousel(-1)} aria-label={t('commun.precedent')}
              className={[
                'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10',
                'w-10 h-10 rounded-full flex items-center justify-center',
                'bg-card/90 backdrop-blur-sm border border-edge shadow-lg',
                'text-ink hover:bg-primary hover:border-primary hover:text-inverse hover:scale-110 active:scale-95',
                'transition-all duration-300',
                carouselEdge.left ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none',
              ].join(' ')}>
              <ChevronLeft size={17} strokeWidth={2.5} />
            </button>
            {/* Dégradé droite + flèche droite */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-elevated to-transparent" />
            <button onClick={() => scrollCarousel(1)} aria-label={t('commun.suivant')}
              className={[
                'absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10',
                'w-10 h-10 rounded-full flex items-center justify-center',
                'bg-card/90 backdrop-blur-sm border border-edge shadow-lg',
                'text-ink hover:bg-primary hover:border-primary hover:text-inverse hover:scale-110 active:scale-95',
                'transition-all duration-300',
                carouselEdge.right ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none',
              ].join(' ')}>
              <ChevronRight size={17} strokeWidth={2.5} />
            </button>
          </div>
          <div className="text-center mt-8">
            <Link to="/createurs" className={btnPrimary}>{t('vitrine.creators.see_all')}</Link>
          </div>
        </div>
      </section>

      {/* GALERIE */}
      <section id="gallery" className="py-16 scroll-mt-[76px]">
        <div className="max-w-[1180px] mx-auto px-5">
          <SectionHead eyebrow={t('vitrine.gallery.eyebrow')} title={t('vitrine.gallery.title')} subtitle={t('vitrine.gallery.subtitle')} />
          <div className="vt-reveal flex gap-2.5 justify-center flex-wrap mb-7">
            {categories.map((c) => (
              <button key={c.key} onClick={() => setCat(c.key)}
                      className={`vt-filter text-[13px] font-medium px-4 py-1.5 rounded-full border ${cat === c.key ? 'bg-primary border-primary text-inverse' : 'bg-card border-edge text-dim hover:border-primary hover:text-primary'}`}>
                {t(`vitrine.gallery.cats.${c.key}`)}
              </button>
            ))}
          </div>
          {/* Hauteurs alternées pour l'effet masonry Pinterest */}
          {(() => {
            const heights = ['aspect-[2/3]', 'aspect-[3/5]', 'aspect-[3/4]', 'aspect-[2/3]', 'aspect-[3/5]']
            return models === null ? (
              <div className="columns-2 md:columns-4 gap-3">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="break-inside-avoid mb-3">
                    <SkeletonGalleryCard imgClass={heights[i % heights.length]} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="vt-stagger columns-2 md:columns-4 gap-3">
                {models.map((m, i) => {
                  const slug = m.atelier_id ?? creatorSlugByName[m.par] ?? null
                  return (
                    <div key={m.id} className="vt-item break-inside-avoid mb-3">
                      <Link
                        to={slug ? `/createurs/${slug}` : '/createurs'}
                        className="vt-card block bg-card border border-edge rounded-xl overflow-hidden group"
                      >
                        <div className={`${heights[i % heights.length]} relative w-full`}>
                          {m.image_url
                            ? <img src={m.image_url} alt={m.nom} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                            : <GarmentVisual cat={m.cat} gradient={m.gradient} className="absolute inset-0 h-full w-full" />}
                          <span data-theme="dark" className="absolute top-2.5 left-2.5 text-inverse text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-inset/80 backdrop-blur-sm">{m.type}</span>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        </div>
                        <div className="p-3">
                          <h4 className="font-semibold text-[14px] text-ink leading-snug">{m.nom}</h4>
                          <div className="text-[11.5px] text-dim mt-0.5 mb-1.5">{t('vitrine.gallery.by')} {m.par}</div>
                          <div className="font-bold text-primary text-[14px]">{format(m.prix)}</div>
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            )
          })()}
          <p className="text-2xs text-ghost mt-4 text-center">{t('vitrine.indicatif')}</p>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="py-16 bg-elevated">
        <div className="max-w-[1180px] mx-auto px-5">
          <SectionHead eyebrow={t('vitrine.testimonials.eyebrow')} title={t('vitrine.testimonials.title')} />
          <div className="vt-stagger grid grid-cols-1 md:grid-cols-3 gap-5">
            {(t('vitrine.testimonials.list', { returnObjects: true }) || []).map((item, i) => (
              <figure key={i} className="vt-item vt-card bg-card border border-edge rounded-lg p-6">
                <div className="text-primary mb-3 inline-flex items-center gap-0.5" aria-label="5/5">
                  {Array.from({ length: 5 }, (_, n) => (
                    <Star key={n} size={13} className="fill-current" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-[14.5px] text-ink leading-relaxed mb-5">"{item.texte}"</blockquote>
                <figcaption className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] text-inverse shrink-0" style={{ background: item.gradient }}>{item.initiales}</div>
                  <div>
                    <div className="text-[13px] font-semibold text-ink">{item.nom}</div>
                    <div className="text-[12px] text-dim">{item.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* REJOINDRE — créateurs */}
      <section className="py-16">
        <div className="max-w-[1180px] mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="vt-reveal">
              <div className="text-[12px] font-bold tracking-[0.14em] uppercase text-primary mb-2.5">{t('vitrine.join.eyebrow')}</div>
              <h2 className="font-display text-[clamp(26px,3.4vw,38px)] mb-4 text-ink">{t('vitrine.join.title')}</h2>
              <p className="text-dim mb-6">{t('vitrine.join.subtitle')}</p>
              <ul className="space-y-3 mb-8">
                {(t('vitrine.join.benefits', { returnObjects: true }) || []).map((b, i) => (
                  <li key={i} className="flex items-center gap-3 text-[14px] text-ink">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"><Check size={11} strokeWidth={3} aria-hidden="true" /></span>
                    {b}
                  </li>
                ))}
              </ul>
              <Link to="/inscription" className={btnPrimary}>{t('vitrine.join.cta')}</Link>
            </div>
            <div className="vt-reveal grid grid-cols-2 gap-3">
              {[
                { v: t('vitrine.join.stat_1_v'), l: t('vitrine.join.stat_1_l') },
                { v: t('vitrine.join.stat_2_v'), l: t('vitrine.join.stat_2_l') },
                { v: t('vitrine.join.stat_3_v'), l: t('vitrine.join.stat_3_l') },
                { v: t('vitrine.join.stat_4_v'), l: t('vitrine.join.stat_4_l') },
              ].map((s) => (
                <div key={s.l} className="bg-card border border-edge rounded-lg p-5 text-center">
                  <div className="font-display font-bold text-[28px] text-primary leading-none mb-1">{s.v}</div>
                  <div className="text-[12px] text-dim">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SUIVI CTA */}
      <section className="py-16">
        <div className="max-w-[1180px] mx-auto px-5">
          <div data-theme="dark" className="vt-reveal rounded-3xl py-12 px-8 text-center bg-inset text-ink">
            <h2 className="font-display text-[clamp(24px,3vw,34px)]">{t('vitrine.cta.title')}</h2>
            <p className="text-dim mt-2 mb-6">{t('vitrine.cta.subtitle')}</p>
            <Link to="/suivi" className={btnPrimary}>{t('vitrine.cta.button')}</Link>
          </div>
        </div>
      </section>

    </VitrineShell>
  )
}
