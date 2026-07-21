/**
 * VIT-3 — Affichage de la bannière d'un atelier, cadrage appliqué.
 *
 * Les deux écrans qui montrent une bannière (Ma vitrine et le profil public)
 * utilisaient `object-cover`, qui centre l'image d'office : un créateur dont le
 * sujet est en haut ou sur un côté le voyait coupé sans pouvoir rien y faire.
 *
 * Le cadrage est stocké par le serveur en fractions de l'image
 * (`{ x, y, largeur, hauteur }`). Il est appliqué ici via `object-position`,
 * calculé à partir du CENTRE de la zone choisie.
 *
 * Pourquoi le centre et non le rectangle exact : la bande publique est
 * responsive — son rapport largeur/hauteur change avec la taille de l'écran.
 * Forcer un rectangle exact déformerait l'image sur toutes les largeurs qui ne
 * correspondent pas. En gardant `cover` et en déplaçant seulement le point de
 * cadrage, l'image n'est jamais déformée et le sujet reste centré partout.
 *
 * Un seul composant pour les deux écrans : le calcul recopié à deux endroits
 * finit toujours par diverger.
 */

/**
 * Convertit un cadrage en `object-position`.
 *
 * `object-position` s'exprime en pourcentage de la marge de débordement, pas
 * de l'image : 0 % colle le bord gauche, 100 % le bord droit. Le centre de la
 * zone choisie doit donc être rapporté à l'intervalle restant.
 */
export function positionDepuisCadrage(cadrage) {
  if (!cadrage) return '50% 50%'

  const { x = 0, y = 0, largeur = 1, hauteur = 1 } = cadrage

  const centreX = x + largeur / 2
  const centreY = y + hauteur / 2

  // Bornage : un cadrage aberrant (valeurs hors limites) ne doit pas produire
  // une position absurde, seulement un recentrage.
  const pct = (v) => `${Math.min(100, Math.max(0, v * 100)).toFixed(2)}%`

  return `${pct(centreX)} ${pct(centreY)}`
}

export default function BanniereAtelier({ url, type, cadrage, className = '', ...rest }) {
  if (!url) return null

  const position = positionDepuisCadrage(cadrage)

  // Une vidéo n'est pas recadrable ici (le contrôle porte sur une image fixe) ;
  // elle reste centrée, comme avant.
  if (type === 'video') {
    return (
      <video src={url} className={`w-full h-full object-cover ${className}`}
             autoPlay muted loop playsInline {...rest} />
    )
  }

  return (
    <img src={url} alt="" style={{ objectPosition: position }}
         className={`w-full h-full object-cover ${className}`} {...rest} />
  )
}
