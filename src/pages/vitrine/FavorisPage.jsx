import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import VitrineShell from './VitrineChrome'
import { getCreators } from './vitrineApi'
import { useFavoris } from './useFavoris'

export default function FavorisPage() {
  const { t } = useTranslation()
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
            <p className="text-dim">{t('vitrine.loading')}</p>
          ) : favs.length === 0 ? (
            <p className="text-dim">{t('vitrine.favoris.empty')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favs.map((c) => (
                <Link key={c.id} to={`/createurs/${c.id}`}
                      className="bg-card border border-edge rounded-lg p-5 flex items-center gap-3 transition hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
                  <div className="w-[52px] h-[52px] rounded-xl overflow-hidden flex items-center justify-center font-display font-bold text-lg text-white shrink-0" style={c.logo_url ? undefined : { background: c.gradient }}>
                    {c.logo_url ? <img src={c.logo_url} alt={c.nom} className="w-full h-full object-cover" /> : c.initiales}
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
