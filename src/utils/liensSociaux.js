/**
 * QA-1 / L2-SOCIAL — Transformer une saisie libre en lien qui s'ouvre.
 *
 * Les champs « Instagram », « Facebook », « Site web »… sont remplis à la main
 * par les créateurs, dans toutes les formes imaginables : `@monatelier`,
 * `monatelier`, `instagram.com/monatelier`, `www.instagram.com/monatelier` ou
 * l'URL complète. Toutes doivent aboutir au même lien.
 *
 * Le code précédent ne testait que `startsWith('http')` et préfixait le reste
 * par le domaine du réseau. Deux saisies parfaitement naturelles produisaient
 * donc une URL absurde :
 *
 *   « instagram.com/monatelier »  →  https://instagram.com/instagram.com/monatelier
 *
 * Le lien s'ouvrait sur une page d'erreur, et le créateur n'avait aucun moyen
 * de comprendre pourquoi. Ce test vivait recopié SIX fois (une par réseau) dans
 * la page de profil, ce qui garantissait que la correction soit oubliée quelque
 * part.
 */

/**
 * Réseaux reconnus. `hote` sert à repérer une saisie qui contient déjà le
 * domaine ; `prefixe` construit le lien à partir d'un simple pseudo.
 */
const RESEAUX = {
  instagram: { hote: 'instagram.com',  prefixe: 'https://instagram.com/' },
  facebook:  { hote: 'facebook.com',   prefixe: 'https://facebook.com/' },
  tiktok:    { hote: 'tiktok.com',     prefixe: 'https://tiktok.com/@' },
  youtube:   { hote: 'youtube.com',    prefixe: 'https://youtube.com/@' },
  linkedin:  { hote: 'linkedin.com',   prefixe: 'https://linkedin.com/in/' },
  twitter:   { hote: 'twitter.com',    prefixe: 'https://twitter.com/' },
  site:      { hote: null,             prefixe: 'https://' },
}

const HOTES_CONNUS = Object.values(RESEAUX).map((r) => r.hote).filter(Boolean)

/**
 * Une saisie ressemble-t-elle à une adresse plutôt qu'à un pseudo ?
 *
 * La question n'a pas la même réponse selon le champ, et c'est là qu'un test
 * unique se trompe : `mon.pseudo` est un pseudo Instagram parfaitement courant
 * (les points sont autorisés), alors que dans le champ « site web » la même
 * chaîne ne peut être qu'un domaine.
 *
 * Pour un RÉSEAU, on n'y voit une adresse que si elle nomme un hôte connu ou
 * contient un chemin. Pour le champ SITE, tout ce qui a la forme d'un domaine
 * en est un.
 */
function ressembleAUneAdresse(v, reseau) {
  const formeDomaine = /^[\w-]+(\.[\w-]+)*\.[a-z]{2,}(\/|$)/i.test(v)

  if (reseau === 'site' || !RESEAUX[reseau]?.hote) return formeDomaine

  const sansWww = v.replace(/^www\./i, '').toLowerCase()

  // Un hôte d'un AUTRE réseau compte aussi : coller un lien Facebook dans le
  // champ Instagram est une erreur de saisie fréquente, et le lien doit quand
  // même s'ouvrir sur la bonne page plutôt que sur une URL inventée.
  return HOTES_CONNUS.some((h) => sansWww.startsWith(`${h}/`) || sansWww === h)
}

/**
 * Rend une URL absolue à partir d'une saisie libre, ou `null` si le champ est
 * vide. Ne valide PAS l'existence du compte : on garantit un lien bien formé,
 * pas un lien qui aboutit.
 *
 * @param {string} saisie  ce que le créateur a tapé
 * @param {string} reseau  clé de RESEAUX ; inconnue = traitée comme un site web
 */
export function lienSocial(saisie, reseau = 'site') {
  const v = String(saisie ?? '').trim()
  if (!v) return null

  // 1. URL déjà complète : on n'y touche pas.
  if (/^https?:\/\//i.test(v)) return v

  // 2. Saisie contenant un domaine (avec ou sans « www. ») : il ne manque que
  //    le protocole. C'est le cas que l'ancien code transformait en absurdité.
  if (ressembleAUneAdresse(v, reseau)) return `https://${v}`

  // 3. Pseudo simple : on le colle au préfixe du réseau. Le « @ » de tête est
  //    retiré — il fait partie de l'usage, jamais de l'URL.
  const { prefixe } = RESEAUX[reseau] ?? RESEAUX.site

  return prefixe + v.replace(/^@+/, '')
}

/**
 * Étiquette lisible pour l'affichage : « @monatelier » plutôt que l'URL
 * complète, qui déborde sur mobile.
 */
export function etiquetteSociale(saisie, reseau = 'site') {
  const v = String(saisie ?? '').trim()
  if (!v) return ''

  const { hote } = RESEAUX[reseau] ?? RESEAUX.site

  // D'une URL on ne garde que le dernier segment de chemin — le pseudo.
  if (/^https?:\/\//i.test(v) || ressembleAUneAdresse(v, reseau)) {
    const sansProtocole = v.replace(/^https?:\/\//i, '').replace(/\/+$/, '')
    const segments = sansProtocole.split('/')

    // Un site web propre s'affiche par son domaine, pas par son chemin.
    if (!hote) return segments[0].replace(/^www\./i, '')

    const dernier = segments[segments.length - 1]

    return dernier && dernier !== segments[0] ? `@${dernier.replace(/^@+/, '')}` : sansProtocole
  }

  return hote ? `@${v.replace(/^@+/, '')}` : v
}
