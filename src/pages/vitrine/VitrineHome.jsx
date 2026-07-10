import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import VitrineShell from './VitrineChrome'
import { getCreators, getCreations, demoModels, categories } from './vitrineApi'
import GarmentVisual from './GarmentVisual'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useDevise } from './vitrineCurrency'
import { useFavoris } from './useFavoris'
import { SkeletonCreatorCard, SkeletonGalleryCard } from './VitrineSkeletons'

const btnPrimary = 'vt-btn-primary inline-flex items-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl bg-primary text-inverse hover:bg-primary-600'
const btnOutline = 'vt-btn-ghost inline-flex items-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl border border-edge text-ink hover:border-primary hover:text-primary'

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

  const rotations = t('vitrine.rotations', { returnObjects: true })
  const steps = t('vitrine.how.steps', { returnObjects: true })

  useEffect(() => {
    const id = setInterval(() => setRot((v) => v + 1), 2600)
    return () => clearInterval(id)
  }, [])
  useEffect(() => { getCreators().then(setCreators) }, [])
  useEffect(() => { getCreations().then(setGalleryModels) }, [])

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
    const el = document.querySelector(location.hash)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash, creators])

  const models = galleryModels
    ? (cat === 'all' ? galleryModels : galleryModels.filter((m) => m.cat === cat))
    : null
  const rotMsg = Array.isArray(rotations) && rotations.length ? rotations[rot % rotations.length] : ''
  const prm = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <VitrineShell>
      {/* HERO */}
      <section className="relative overflow-hidden pt-16 pb-12 text-center isolate">
        {/* ── Fond animé multicouche — ambiance défilé ── */}
        <div className="vt-hero-bg" aria-hidden="true">

          {/* Couche 1 — Mesh wash */}
          <div className="vt-hero-mesh" />

          {/* Couche 2 — Rubans de soie (SMIL) */}
          <svg className="vt-hero-ribbons" viewBox="0 0 1220 640" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="vt-rb1" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7A0606" />
                <stop offset="50%" stopColor="#D00B0B" />
                <stop offset="100%" stopColor="#7A0606" />
              </linearGradient>
              <linearGradient id="vt-rb2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A87F3E" />
                <stop offset="50%" stopColor="#CDA662" />
                <stop offset="100%" stopColor="#A87F3E" />
              </linearGradient>
              <linearGradient id="vt-rb3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#E82A1E" stopOpacity="0" />
                <stop offset="30%"  stopColor="#E82A1E" />
                <stop offset="70%"  stopColor="#D00B0B" />
                <stop offset="100%" stopColor="#D00B0B" stopOpacity="0" />
              </linearGradient>
              <filter id="vt-soft"><feGaussianBlur stdDeviation="1" /></filter>
            </defs>

            {/* Ruban rouge large — bas-gauche → haut-droit, 16 s, amplitude ×3 */}
            <path fill="url(#vt-rb1)" filter="url(#vt-soft)" opacity="0.60"
              d="M 0,530 C 300,395 600,195 900,105 C 1050,60 1150,35 1220,25 L 1220,125 C 1150,138 1050,162 900,208 C 600,305 300,512 0,645 Z">
              {!prm && <animate attributeName="d" dur="16s" calcMode="spline" keyTimes="0;0.5;1" keySplines=".45,0,.55,1;.45,0,.55,1" repeatCount="indefinite"
                values="M 0,530 C 300,395 600,195 900,105 C 1050,60 1150,35 1220,25 L 1220,125 C 1150,138 1050,162 900,208 C 600,305 300,512 0,645 Z;M 0,460 C 300,458 600,172 900,172 C 1050,128 1150,98 1220,88 L 1220,182 C 1150,196 1050,224 900,272 C 600,272 300,448 0,570 Z;M 0,530 C 300,395 600,195 900,105 C 1050,60 1150,35 1220,25 L 1220,125 C 1150,138 1050,162 900,208 C 600,305 300,512 0,645 Z" />}
            </path>

            {/* Ruban or moyen — haut-gauche → bas-droit, 22 s, amplitude ×2.5 */}
            <path fill="url(#vt-rb2)" filter="url(#vt-soft)" opacity="0.48"
              d="M 0,45 C 300,165 600,295 900,380 C 1050,422 1150,462 1220,472 L 1220,548 C 1150,534 1050,496 900,450 C 600,358 300,225 0,118 Z">
              {!prm && <animate attributeName="d" dur="22s" calcMode="spline" keyTimes="0;0.5;1" keySplines=".45,0,.55,1;.45,0,.55,1" repeatCount="indefinite"
                values="M 0,45 C 300,165 600,295 900,380 C 1050,422 1150,462 1220,472 L 1220,548 C 1150,534 1050,496 900,450 C 600,358 300,225 0,118 Z;M 0,105 C 300,125 600,315 900,330 C 1050,368 1150,412 1220,422 L 1220,500 C 1150,490 1050,448 900,398 C 600,302 300,188 0,178 Z;M 0,45 C 300,165 600,295 900,380 C 1050,422 1150,462 1220,472 L 1220,548 C 1150,534 1050,496 900,450 C 600,358 300,225 0,118 Z" />}
            </path>

            {/* Ruban rouge vif fin — courbe centrale, 10 s, amplitude ×2.5 */}
            <path fill="url(#vt-rb3)" filter="url(#vt-soft)" opacity="0.35"
              d="M 0,305 C 250,255 550,418 800,348 C 1000,298 1120,272 1220,255 L 1220,285 C 1120,302 1000,328 800,378 C 550,448 250,295 0,348 Z">
              {!prm && <animate attributeName="d" dur="10s" calcMode="spline" keyTimes="0;0.5;1" keySplines=".45,0,.55,1;.45,0,.55,1" repeatCount="indefinite"
                values="M 0,305 C 250,255 550,418 800,348 C 1000,298 1120,272 1220,255 L 1220,285 C 1120,302 1000,328 800,378 C 550,448 250,295 0,348 Z;M 0,375 C 250,298 550,372 800,295 C 1000,248 1120,225 1220,208 L 1220,242 C 1120,258 1000,285 800,332 C 550,405 250,332 0,415 Z;M 0,305 C 250,255 550,418 800,348 C 1000,298 1120,272 1220,255 L 1220,285 C 1120,302 1000,328 800,378 C 550,448 250,295 0,348 Z" />}
            </path>
          </svg>

          {/* Couche 3 — Spotlight de podium */}
          <div className="vt-hero-spotlight" />

          {/* Couche 4 — Lueurs radiales pulsantes */}
          <div className="vt-hero-glows" />

          {/* Couche 5 — Reflet de défilé */}
          <div className="vt-hero-shimmer" />

          {/* Couche 6 — Grain film statique */}
          <div className="vt-hero-grain" />
        </div>

        <div className="vt-stagger max-w-[1180px] mx-auto px-5 relative">
          <div className="vt-item text-[12px] font-bold tracking-[0.14em] uppercase text-primary">{t('vitrine.hero.eyebrow')}</div>
          <h1 className="vt-item font-display font-extrabold mx-auto max-w-[880px] my-3.5 text-[clamp(34px,6vw,60px)] leading-[1.08] text-ink">
            {t('vitrine.hero.title_pre')}<span className="text-primary">{t('vitrine.hero.title_hl')}</span>{t('vitrine.hero.title_post')}
          </h1>
          <div className="vt-item h-7 mb-6 text-dim text-[clamp(15px,2vw,19px)] font-medium">
            <b className="text-ink font-semibold">{rotMsg}</b>
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

      {/* COMMENT ÇA MARCHE */}
      <section id="how" className="py-16">
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

      {/* CRÉATEURS */}
      <section id="creators" className="py-16 bg-elevated">
        <div className="max-w-[1180px] mx-auto px-5">
          <SectionHead eyebrow={t('vitrine.creators.eyebrow')} title={t('vitrine.creators.title')} subtitle={t('vitrine.creators.subtitle')} />
          <div className="relative">
          <div className="vt-stagger flex gap-4 overflow-x-auto pb-3.5">
            {(creators || []).map((c) => (
              <Link key={c.id} to={`/createurs/${c.id}`}
                    className="vt-item vt-card relative min-w-[268px] max-w-[268px] bg-card border border-edge rounded-lg p-5">
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(c.id) }} className="absolute top-3 right-3 z-10" aria-label="Favori" aria-pressed={has(c.id)}>
                  <Heart size={16} className={has(c.id) ? 'text-primary' : 'text-ghost'} fill={has(c.id) ? 'currentColor' : 'none'} />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-[50px] h-[50px] rounded-xl overflow-hidden flex items-center justify-center font-display font-bold text-lg text-inverse shrink-0" style={c.logo_url ? undefined : { background: c.gradient }}>{c.logo_url ? <img src={c.logo_url} alt={c.nom} className="w-full h-full object-cover" loading="lazy" /> : c.initiales}</div>
                  <div>
                    <h4 className="font-bold text-[15.5px] text-ink flex items-center gap-1.5">
                      {c.nom}
                      {c.verifie && <span className="text-[10.5px] font-bold text-primary bg-primary-50 px-1.5 py-0.5 rounded-full">{t('vitrine.creators.verified')}</span>}
                      {c.sponsorise && <span title="Sponsorisé" className="text-[10.5px] font-bold text-inverse bg-primary px-1.5 py-0.5 rounded-full">★</span>}
                    </h4>
                    <div className="text-[12.5px] text-dim">{c.specialite}</div>
                  </div>
                </div>
                <div className="text-[13px] text-dim mb-3.5">
                  {c.note ? <span className="text-primary font-bold">★ {c.note}</span> : <span className="text-ghost">{t('vitrine.creators.new')}</span>}
                  {' · '}📍 {c.ville}
                </div>
                <span className={btnOutline + ' w-full justify-center !py-2 text-[13px]'}>{t('vitrine.creators.visit')}</span>
              </Link>
            ))}
            {!creators && Array.from({ length: 4 }, (_, i) => (
              <SkeletonCreatorCard key={i} className="min-w-[268px] max-w-[268px] shrink-0" />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-elevated to-transparent lg:hidden" />
          </div>
          <div className="text-center mt-8">
            <Link to="/createurs" className={btnPrimary}>{t('vitrine.creators.see_all')}</Link>
          </div>
        </div>
      </section>

      {/* GALERIE */}
      <section id="gallery" className="py-16">
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
          {models === null ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }, (_, i) => <SkeletonGalleryCard key={i} />)}
            </div>
          ) : (
            <div className="vt-stagger grid grid-cols-2 md:grid-cols-4 gap-4">
              {models.map((m) => (
                <div key={m.id} className="vt-item vt-card bg-card border border-edge rounded-lg overflow-hidden">
                  <div className="h-[160px] relative">
                    {m.image_url
                      ? <img src={m.image_url} alt={m.nom} className="h-full w-full object-cover" loading="lazy" />
                      : <GarmentVisual cat={m.cat} gradient={m.gradient} className="h-full w-full" />}
                    <span data-theme="dark" className="absolute top-2.5 left-2.5 text-inverse text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-inset">{m.type}</span>
                  </div>
                  <div className="p-3.5">
                    <h4 className="font-semibold text-[14.5px] text-ink">{m.nom}</h4>
                    <div className="text-[12px] text-dim mt-0.5 mb-1.5">{t('vitrine.gallery.by')} {m.par}</div>
                    <div className="font-bold text-primary text-[14.5px]">{format(m.prix)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                <div className="text-primary text-[13px] mb-3">★★★★★</div>
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
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
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
