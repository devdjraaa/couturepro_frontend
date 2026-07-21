import { useEffect, useState } from 'react'
import { Megaphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { API_BASE_URL } from '@/constants/config'

/**
 * ANN-8 — Bande d'annonces défilante, en haut de l'application.
 *
 * Les annonces des créateurs existaient déjà côté serveur (publication, durée,
 * Boost payant, modération) mais n'avaient **aucun endroit où s'afficher** :
 * un créateur pouvait payer un Boost sans que personne ne voie jamais son
 * annonce.
 *
 * L'ordre vient du SERVEUR — les annonces boostées d'abord. Le trier ici
 * reviendrait à décider côté écran de ce qui a été payé, et un créateur qui
 * paie doit être servi par la même règle pour tout le monde.
 *
 * Le défilement réutilise `.gx-marquee`, déjà employé par le bandeau
 * partenaires : même mouvement, même vitesse, pause au survol.
 */

// Les annonces changent peu dans une session de travail ; les redemander en
// continu serait du trafic pour rien.
const RAFRAICHIR_MS = 10 * 60 * 1000

export default function BandeAnnonces() {
  const { t } = useTranslation()
  const [annonces, setAnnonces] = useState([])

  useEffect(() => {
    let vivant = true

    const charger = () => {
      fetch(`${API_BASE_URL}/vitrine/annonces`, { headers: { Accept: 'application/json' } })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (vivant) setAnnonces(d?.annonces ?? []) })
        .catch(() => { /* hors ligne : la bande disparaît, rien de plus */ })
    }

    charger()
    const id = setInterval(charger, RAFRAICHIR_MS)

    return () => { vivant = false; clearInterval(id) }
  }, [])

  // Aucune annonce en cours : pas de bande vide. Une bande qui occupe la place
  // sans rien dire ronge l'espace utile de chaque écran.
  if (annonces.length === 0) return null

  // La liste est dupliquée pour que la boucle se referme sans saut visible.
  const suite = [...annonces, ...annonces]

  return (
    <div className="gx-marquee border-b border-edge bg-primary/[0.06]"
         role="region" aria-label={t('annonces.bande_titre')}>
      <div className="gx-marquee__track py-1.5">
        {suite.map((a, i) => (
          <span key={`${a.id}-${i}`} className="flex items-center gap-2 px-6 shrink-0 text-[13px]">
            <Megaphone size={13} className="text-primary shrink-0" aria-hidden="true" />
            <span className="font-semibold text-ink">{a.titre}</span>
            {a.message && <span className="text-dim">— {a.message}</span>}
            {a.atelier_nom && <span className="text-ghost">· {a.atelier_nom}</span>}
          </span>
        ))}
      </div>
    </div>
  )
}
