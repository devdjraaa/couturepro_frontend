import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getPartenairesCles } from './vitrineApi'

// P204 : bandeau accueil — logos partenaires clés en défilement automatique continu.
// Le défilement auto est INDÉPENDANT des boutons « suivant/précédent » : ces boutons
// ne font pas avancer le bandeau sur place, ils redirigent vers la page /partenaires.
export default function PartenairesBanner() {
  const { t } = useTranslation()
  const [logos, setLogos] = useState(null)

  useEffect(() => { getPartenairesCles().then(setLogos) }, [])

  // Rien à afficher tant qu'aucun partenaire clé n'est configuré (section masquée).
  if (!logos || logos.length === 0) return null

  // On duplique la liste pour un défilement en boucle sans couture.
  const suite = [...logos, ...logos]

  return (
    <section className="py-12 bg-elevated border-y border-edge overflow-hidden">
      <div className="max-w-[1180px] mx-auto px-5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg text-ink">{t('vitrine.partenaires.bandeau_titre')}</h2>
          <div className="flex items-center gap-2">
            {/* suivant/précédent → redirigent vers /partenaires (pas de scroll sur place) */}
            <Link to="/partenaires" aria-label={t('vitrine.partenaires.precedent')}
                  className="w-9 h-9 rounded-full border border-edge flex items-center justify-center text-ink hover:border-primary hover:text-primary transition">
              <ChevronLeft size={18} />
            </Link>
            <Link to="/partenaires" aria-label={t('vitrine.partenaires.suivant')}
                  className="w-9 h-9 rounded-full border border-edge flex items-center justify-center text-ink hover:border-primary hover:text-primary transition">
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Piste défilante (animation CSS continue, indépendante des boutons). */}
      <div className="gx-marquee">
        <div className="gx-marquee__track">
          {suite.map((p, i) => (
            <Link key={`${p.id}-${i}`} to="/partenaires" title={p.nom}
                  className="shrink-0 mx-5 flex items-center justify-center opacity-80 hover:opacity-100 transition">
              {p.logo_url
                ? <img src={p.logo_url} alt={p.nom} className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition" />
                : <span className="h-12 px-4 flex items-center font-display font-bold text-ghost">{p.nom}</span>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
