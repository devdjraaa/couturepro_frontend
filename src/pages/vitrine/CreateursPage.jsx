import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Search, AlertCircle, SlidersHorizontal, X, Star, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import VitrineShell from './VitrineChrome'
import { getCreators } from './vitrineApi'
import { useFavoris } from './useFavoris'
import { usePageMeta } from '@/hooks/usePageMeta'
import { cn } from '@/utils/cn'
import { SkeletonCreatorCard } from './VitrineSkeletons'

function distKm(a, b) {
  const toRad = (d) => (d * Math.PI) / 180
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(x)))
}

const RAYONS = [5, 10, 25, 50, 100]
const TRIS = ['pertinence', 'note', 'distance']

export default function CreateursPage() {
  const { t } = useTranslation()
  usePageMeta({ title: t('vitrine.createurs_page.title'), description: t('vitrine.createurs_page.subtitle'), path: '/createurs' })
  const { has, toggle } = useFavoris()
  const [creators, setCreators] = useState(null)
  const [error, setError] = useState(false)

  const [q, setQ] = useState('')
  const [ville, setVille] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [noteMin, setNoteMin] = useState(0)
  const [myPos, setMyPos] = useState(null)
  const [rayon, setRayon] = useState(25)
  const [tri, setTri] = useState('pertinence')
  const [showFilters, setShowFilters] = useState(false)
  const [geoDenied, setGeoDenied] = useState(false)

  const reload = () => {
    setError(false)
    setCreators(null)
    getCreators().then(setCreators).catch(() => setError(true))
  }

  useEffect(() => { reload() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const villes = [...new Set((creators || []).map((c) => c.ville).filter(Boolean))].sort()

  const filtered = (creators || []).filter((c) => {
    if (verifiedOnly && !c.verifie) return false
    if (ville && c.ville !== ville) return false
    if (noteMin > 0 && (c.note == null || Number(c.note) < noteMin)) return false
    if (q && !`${c.nom} ${c.specialite || ''}`.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  const withDist = filtered.map((c) => ({
    ...c,
    _dist: (myPos && c.latitude != null && c.longitude != null)
      ? distKm(myPos, { lat: c.latitude, lng: c.longitude })
      : null,
  }))

  // Filtre par rayon si position connue
  const inRadius = myPos
    ? withDist.filter((c) => c._dist == null || c._dist <= rayon)
    : withDist

  const sorted = [...inRadius].sort((a, b) => {
    if (tri === 'note')     return (b.note ?? 0) - (a.note ?? 0)
    if (tri === 'distance') return (a._dist ?? Infinity) - (b._dist ?? Infinity)
    // pertinence : sponsorisés en premier, puis vérifiés
    return (b.sponsorise ? 1 : 0) - (a.sponsorise ? 1 : 0)
      || (b.verifie ? 1 : 0) - (a.verifie ? 1 : 0)
  })

  const findNearby = () => {
    if (!navigator.geolocation) return
    setGeoDenied(false)
    navigator.geolocation.getCurrentPosition(
      (pos) => { setMyPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setTri('distance') },
      () => { setGeoDenied(true) },
    )
  }

  const clearPos = () => { setMyPos(null); setGeoDenied(false); if (tri === 'distance') setTri('pertinence') }

  const hasActiveFilters = q || ville || verifiedOnly || noteMin > 0 || myPos

  return (
    <VitrineShell>
      <section className="py-16">
        <div className="max-w-[1180px] mx-auto px-5">
          <div className="text-center mb-9">
            <div className="text-[12px] font-bold tracking-[0.14em] uppercase text-primary">{t('vitrine.createurs_page.eyebrow')}</div>
            <h1 className="font-display font-extrabold text-[clamp(28px,4vw,40px)] mt-2 text-ink">{t('vitrine.createurs_page.title')}</h1>
            <p className="text-dim mt-1">{t('vitrine.createurs_page.subtitle')}</p>
          </div>

          {/* Barre de recherche principale */}
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ghost pointer-events-none" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('vitrine.createurs_page.filter_search')}
                className="w-full rounded-lg border border-edge bg-card pl-9 pr-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <select value={tri} onChange={(e) => setTri(e.target.value)}
                    className="rounded-lg border border-edge bg-card px-3 py-2 text-sm text-dim focus:outline-none">
              {TRIS.map((s) => <option key={s} value={s}>{t(`vitrine.createurs_page.tri.${s}`)}</option>)}
            </select>

            <button
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition',
                showFilters ? 'border-primary bg-primary/5 text-primary' : 'border-edge text-dim hover:border-primary hover:text-primary',
              )}
            >
              <SlidersHorizontal size={14} />
              {t('vitrine.createurs_page.filter_label')}
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          </div>

          {/* Panneau filtres avancés */}
          {showFilters && (
            <div className="bg-card border border-edge rounded-xl p-4 mb-5 flex flex-wrap gap-4">
              {/* Ville */}
              <div className="flex flex-col gap-1 min-w-[160px]">
                <label className="text-xs font-semibold text-ghost uppercase tracking-wide">{t('vitrine.createurs_page.filter_city')}</label>
                <select value={ville} onChange={(e) => setVille(e.target.value)}
                        className="rounded-lg border border-edge bg-app px-3 py-2 text-sm text-dim focus:outline-none">
                  <option value="">{t('vitrine.createurs_page.filter_all_cities')}</option>
                  {villes.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              {/* Note minimale */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-ghost uppercase tracking-wide">{t('vitrine.createurs_page.filter_rating')}</label>
                <div className="flex gap-1">
                  {[0, 3, 4, 4.5].map((n) => (
                    <button key={n} onClick={() => setNoteMin(n)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg border text-xs font-bold transition',
                              noteMin === n ? 'border-primary bg-primary/5 text-primary' : 'border-edge text-dim hover:border-primary',
                            )}>
                      {n === 0 ? t('vitrine.createurs_page.filter_all') : (
                        <span className="inline-flex items-center gap-1">
                          <Star size={12} className="fill-current" aria-hidden="true" />{n}+
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vérifiés uniquement */}
              <div className="flex flex-col gap-1 justify-end">
                <label className="flex items-center gap-2 text-sm text-dim cursor-pointer">
                  <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)}
                         className="w-4 h-4 accent-primary rounded" />
                  {t('vitrine.createurs_page.filter_verified')}
                </label>
              </div>

              {/* Géolocalisation + rayon */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-ghost uppercase tracking-wide">{t('vitrine.createurs_page.filter_nearby')}</label>
                {myPos ? (
                  <div className="flex items-center gap-2">
                    <select value={rayon} onChange={(e) => setRayon(Number(e.target.value))}
                            className="rounded-lg border border-edge bg-app px-3 py-2 text-sm text-dim focus:outline-none">
                      {RAYONS.map((r) => <option key={r} value={r}>≤ {r} km</option>)}
                    </select>
                    <button onClick={clearPos} className="w-7 h-7 flex items-center justify-center rounded-lg border border-edge text-ghost hover:text-danger transition">
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <button onClick={findNearby}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-edge px-3 py-2 text-sm text-dim hover:border-primary hover:text-primary transition">
                    <MapPin size={14} aria-hidden="true" />
                    {t('vitrine.createurs_page.near_me')}
                  </button>
                )}
                {geoDenied && !myPos && (
                  <p className="text-[11px] text-danger mt-1">{t('vitrine.createurs_page.geo_denied')}</p>
                )}
              </div>

              {/* Reset */}
              {hasActiveFilters && (
                <div className="flex flex-col justify-end ml-auto">
                  <button
                    onClick={() => { setQ(''); setVille(''); setVerifiedOnly(false); setNoteMin(0); clearPos() }}
                    className="text-xs font-semibold text-ghost hover:text-danger transition"
                  >
                    {t('vitrine.createurs_page.clear_all')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Résumé actif */}
          {creators && (
            <p aria-live="polite" className="text-xs text-ghost mb-4 text-center">
              {t('vitrine.createurs_page.count', { count: sorted.length })}
              {myPos && ` · ${t('vitrine.createurs_page.in_radius', { rayon })}`}
            </p>
          )}

          {/* État chargement */}
          {!creators && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, i) => <SkeletonCreatorCard key={i} />)}
            </div>
          )}

          {/* État erreur */}
          {error && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <AlertCircle size={28} className="text-danger" />
              <p className="text-sm text-dim">{t('erreurs.chargement')}</p>
              <button onClick={reload} className="text-sm font-semibold text-primary hover:underline">
                {t('vitrine.createurs_page.retry')}
              </button>
            </div>
          )}

          {/* État vide */}
          {creators && sorted.length === 0 && !error && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Search size={28} className="text-ghost" />
              <p className="text-sm text-dim">{t('vitrine.createurs_page.empty')}</p>
              {hasActiveFilters && (
                <button
                  onClick={() => { setQ(''); setVille(''); setVerifiedOnly(false); setNoteMin(0); clearPos() }}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {t('vitrine.createurs_page.reset_filters')}
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((c) => (
              <Link key={c.id} to={`/createurs/${c.id}`}
                    className="relative bg-card border border-edge rounded-lg p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(c.id) }} className="absolute top-3 right-3 z-10" aria-label={t('vitrine.a11y.favori')} aria-pressed={has(c.id)}>
                  <Heart size={16} className={has(c.id) ? 'text-primary' : 'text-ghost'} fill={has(c.id) ? 'currentColor' : 'none'} />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-[52px] h-[52px] rounded-xl overflow-hidden flex items-center justify-center font-display font-bold text-lg text-inverse shrink-0" style={c.logo_url ? undefined : { background: c.gradient }}>
                    {c.logo_url ? <img src={c.logo_url} alt={c.nom} className="w-full h-full object-cover" loading="lazy" /> : c.initiales}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-ink flex items-center gap-1.5 flex-wrap">
                      {c.nom}
                      {c.verifie && <span className="text-[10.5px] font-bold text-primary bg-primary-50 px-1.5 py-0.5 rounded-full">{t('vitrine.creators.verified')}</span>}
                      {c.sponsorise && <span title={t('vitrine.a11y.sponsorise')} className="inline-flex items-center text-inverse bg-primary px-1.5 py-0.5 rounded-full"><Star size={10} className="fill-current" aria-hidden="true" /></span>}
                    </h3>
                    <div className="text-[12.5px] text-dim">{c.specialite} · {c.ville}</div>
                  </div>
                </div>
                <div className="flex gap-3.5 text-[13px] text-dim flex-wrap">
                  {c.note ? <span className="text-primary font-bold inline-flex items-center gap-1"><Star size={12} className="fill-current" aria-hidden="true" />{c.note}</span> : <span className="text-ghost">{t('vitrine.creators.new')}</span>}
                  {c.nb_creations > 0 ? <span>· {t('vitrine.creators.creations_count', { n: c.nb_creations, count: c.nb_creations })}</span> : null}
                  {c.experience ? <span>· {c.experience}</span> : null}
                  {c._dist != null ? <span>· {c._dist} km</span> : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </VitrineShell>
  )
}
