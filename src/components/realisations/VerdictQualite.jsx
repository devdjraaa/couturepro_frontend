import { useEffect, useState } from 'react'
import { Expand, Crop, Sun, Focus, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * PHOTO-1 — Retour qualité instantané, PUREMENT VISUEL.
 *
 * Le contrôle automatique tourne déjà côté serveur et renvoie des codes
 * (`resolution`, `cadrage`, `luminosite`, `nettete`). L'écran se contentait
 * d'afficher le message d'erreur brut du serveur — une phrase, souvent la même,
 * qui ne dit pas au créateur CE QU'IL doit changer.
 *
 * La demande est explicite : icône, couleur, animation, **aucun texte**. Un
 * créateur qui photographie sa pièce doit comprendre d'un coup d'œil, sans
 * lire, ce qui cloche — et recommencer. C'est plus rapide qu'une phrase, et ça
 * marche quelle que soit la langue ou le niveau de lecture.
 *
 * Le texte reste présent en `title` et en `aria-label` : invisible à l'œil,
 * disponible pour un lecteur d'écran et au survol. Retirer le texte de
 * l'affichage ne veut pas dire rendre l'information inaccessible.
 */

// Un pictogramme par cause de refus. Le geste correctif doit se deviner :
// « agrandir » pour une image trop petite, « recadrer » pour des proportions
// extrêmes, « soleil » pour l'exposition, « mise au point » pour le flou.
const PICTOS = {
  resolution: Expand,
  cadrage:    Crop,
  luminosite: Sun,
  nettete:    Focus,
}

/**
 * @param {string[]} problemes       codes bloquants — la photo est refusée
 * @param {string[]} avertissements  codes non bloquants — la photo passe
 */
export default function VerdictQualite({ problemes = [], avertissements = [], onFini }) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(true)

  const codes = problemes.length ? problemes : avertissements
  const bloquant = problemes.length > 0

  // Le verdict s'efface de lui-même. Un bandeau d'erreur qui reste fige
  // l'écran sur un échec passé, alors que le créateur a déjà renvoyé sa photo.
  useEffect(() => {
    setVisible(true)
    const delai = setTimeout(() => {
      setVisible(false)
      onFini?.()
    }, bloquant ? 6000 : 3500)

    return () => clearTimeout(delai)
  }, [codes.join(','), bloquant]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible || codes.length === 0) return null

  const teinte = bloquant
    ? 'bg-danger/10 text-danger border-danger/25'
    : 'bg-warning/10 text-warning border-warning/25'

  return (
    <div
      role="status"
      className={`flex items-center justify-center gap-3 rounded-xl border px-4 py-3 ${teinte} gx-verdict`}
    >
      {codes.map((code) => {
        const Picto = PICTOS[code]
        if (!Picto) return null

        // Le libellé n'est PAS affiché : il sert au survol et aux lecteurs
        // d'écran. L'information reste accessible sans encombrer l'image.
        const libelle = t(`realisations.qualite.${code}`)

        return (
          <span
            key={code}
            title={libelle}
            aria-label={libelle}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-current/10"
          >
            <Picto size={20} aria-hidden="true" />
          </span>
        )
      })}
    </div>
  )
}

/** Pastille verte brève quand la photo passe sans réserve. */
export function VerdictOk({ onFini }) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const delai = setTimeout(() => { setVisible(false); onFini?.() }, 1800)

    return () => clearTimeout(delai)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null

  return (
    <div role="status"
         aria-label={t('realisations.qualite.ok')}
         title={t('realisations.qualite.ok')}
         className="flex items-center justify-center rounded-xl border border-success/25 bg-success/10 text-success px-4 py-3 gx-verdict">
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-current/10">
        <Check size={20} aria-hidden="true" />
      </span>
    </div>
  )
}
