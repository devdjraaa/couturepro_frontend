import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import VitrineShell from './VitrineChrome'
import { getCreators } from './vitrineApi'
import { useFavoris } from './useFavoris'

export default function CreateursPage() {
  const { t } = useTranslation()
  const { has, toggle } = useFavoris()
  const [creators, setCreators] = useState(null)
  useEffect(() => { getCreators().then(setCreators) }, [])

  const [q, setQ] = useState('')
  const [ville, setVille] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const villes = [...new Set((creators || []).map((c) => c.ville).filter(Boolean))].sort()
  const filtered = (creators || []).filter((c) => {
    if (verifiedOnly && !c.verifie) return false
    if (ville && c.ville !== ville) return false
    if (q && !`${c.nom} ${c.specialite || ''}`.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  return (
    <VitrineShell>
      <section className="py-16">
        <div className="max-w-[1180px] mx-auto px-5">
          <div className="text-center mb-9">
            <div className="text-[12px] font-bold tracking-[0.14em] uppercase text-primary">{t('vitrine.createurs_page.eyebrow')}</div>
            <h1 className="font-display font-extrabold text-[clamp(28px,4vw,40px)] mt-2 text-ink">{t('vitrine.createurs_page.title')}</h1>
            <p className="text-dim mt-1">{t('vitrine.createurs_page.subtitle')}</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('vitrine.createurs_page.filter_search')}
                   className="rounded-lg border border-edge bg-card px-3 py-2 text-sm text-ink w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <select value={ville} onChange={(e) => setVille(e.target.value)} className="rounded-lg border border-edge bg-card px-3 py-2 text-sm text-dim focus:outline-none">
              <option value="">{t('vitrine.createurs_page.filter_all_cities')}</option>
              {villes.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <label className="inline-flex items-center gap-2 text-sm text-dim px-2">
              <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
              {t('vitrine.createurs_page.filter_verified')}
            </label>
          </div>

          {!creators && <p className="text-center text-dim">{t('vitrine.loading')}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <Link key={c.id} to={`/createurs/${c.id}`}
                    className="relative bg-card border border-edge rounded-lg p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(c.id) }} className="absolute top-3 right-3 z-10" aria-label="Favori">
                  <Heart size={16} className={has(c.id) ? 'text-primary' : 'text-ghost'} fill={has(c.id) ? 'currentColor' : 'none'} />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-[52px] h-[52px] rounded-xl overflow-hidden flex items-center justify-center font-display font-bold text-lg text-white shrink-0" style={c.logo_url ? undefined : { background: c.gradient }}>{c.logo_url ? <img src={c.logo_url} alt={c.nom} className="w-full h-full object-cover" /> : c.initiales}</div>
                  <div>
                    <h3 className="font-bold text-base text-ink flex items-center gap-1.5">
                      {c.nom}
                      {c.verifie && <span className="text-[10.5px] font-bold text-primary bg-primary-50 px-1.5 py-0.5 rounded-full">{t('vitrine.creators.verified')}</span>}
                    </h3>
                    <div className="text-[12.5px] text-dim">{c.specialite} · {c.ville}</div>
                  </div>
                </div>
                <div className="flex gap-3.5 text-[13px] text-dim">
                  {c.note ? <span className="text-primary font-bold">★ {c.note}</span> : <span className="text-ghost">{t('vitrine.creators.new')}</span>}
                  {c.experience ? <span>· {c.experience}</span> : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </VitrineShell>
  )
}
