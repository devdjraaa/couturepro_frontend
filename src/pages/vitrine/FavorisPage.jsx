import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import VitrineShell from './VitrineChrome'
import { getCreators } from './vitrineApi'
import { useFavoris } from './useFavoris'
import { usePageMeta } from '@/hooks/usePageMeta'
import { SkeletonCreatorCard } from './VitrineSkeletons'

export default function FavorisPage() {
  const { t } = useTranslation()
  usePageMeta({ title: t('vitrine.favoris.title'), path: '/favoris' })
  const { ids } = useFavoris()
  const [creators, setCreators] = useState(null)

  useEffect(() => { getCreators().then(setCreators) }, [])

  const favs = (creators || []).filter((c) => ids.includes(String(c.id)))

  return (
    <VitrineShell>
      <section className="py-16">
        <div className="max-w-[1180px] mx-auto px-5">
          <h1 className="font-display font-extrabold text-[clamp(28px,4vw,40px)] text-ink mb-6">{t('vitrine.favoris.title')}</h1>

          {!creators ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }, (_, i) => <SkeletonCreatorCard key={i} />)}
            </div>
          ) : favs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-dim mb-5">{t('vitrine.favoris.empty')}</p>
              <Link to="/createurs" className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl bg-primary text-inverse hover:bg-primary-600 transition">
                {t('vitrine.favoris.explore')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favs.map((c) => (
                <Link key={c.id} to={`/createurs/${c.id}`}
                      className="bg-card border border-edge rounded-lg p-5 flex items-center gap-3 transition hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                  <div className="w-[52px] h-[52px] rounded-xl overflow-hidden flex items-center justify-center font-display font-bold text-lg text-inverse shrink-0" style={c.logo_url ? undefined : { background: c.gradient }}>
                    {c.logo_url ? <img src={c.logo_url} alt={c.nom} className="w-full h-full object-cover" loading="lazy" /> : c.initiales}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-ink truncate">{c.nom}</h3>
                    <div className="text-xs text-dim truncate">{c.specialite} · {c.ville}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </VitrineShell>
  )
}
