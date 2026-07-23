/**
 * Traduit la configuration d'un plan en lignes lisibles.
 *
 * SOURCE UNIQUE, volontairement. La page de tarifs et l'offre d'abonnement dans
 * l'application décrivaient les mêmes plans avec deux listes écrites à la main
 * et deux vocabulaires distincts : un même plan ne se lisait pas pareil aux deux
 * endroits, et une clé ajoutée en administration n'apparaissait ni sur l'une ni
 * sur l'autre.
 *
 * Deux principes :
 *  — le TEXTE DÉCOULE DE LA VALEUR. La direction saisit 7 sous-ateliers, les
 *    deux écrans affichent « Jusqu'à 7 ateliers supplémentaires » ;
 *  — le texte lui-même est ÉDITABLE depuis le back-office. Il était figé dans
 *    les fichiers de traduction : renommer « Photos VIP » demandait un
 *    développeur et un déploiement, pour un mot.
 */

/** Fonctions réservées aux comptes designer — masquées pour un artisan. */
export const RESERVE_DESIGNER = new Set(['creations', 'galerie', 'multi'])

export function parseConfig(config) {
  if (!config) return {}
  if (typeof config === 'string') {
    try { return JSON.parse(config) } catch { return {} }
  }
  return config
}

/** null ou -1 signifient « illimité » ; 0 signifie « non inclus ». */
const estIllimite = (v) => v === null || v === -1

/**
 * Résout un libellé : back-office d'abord, texte livré ensuite.
 *
 * Un libellé effacé par erreur en administration ne doit pas laisser un blanc
 * sur une page de tarifs — d'où le repli systématique.
 */
function faireLibelle({ libelles, t, langue }) {
  return (cle, n) => {
    const admin = libelles?.[cle]
    const brut = typeof admin === 'object' && admin !== null
      ? (langue === 'en' ? (admin.en || admin.fr) : admin.fr)
      : admin

    if (typeof brut === 'string' && brut.trim()) {
      return brut.replace(/\{n\}/g, n ?? '')
    }
    return n === undefined
      ? t(`premium.feat.${cle}`)
      : t(`premium.feat.${cle}`, { n, count: Number(n) })
  }
}

/**
 * @param {object|string} config — le `config` du plan, tel que servi par l'API
 * @param {Function} t — la fonction de traduction
 * @param {string} [type] — 'artisan' pour masquer les lignes designer
 * @param {object} [options] — { libelles, langue } venant du back-office
 * @returns {{cle: string, texte: string}[]}
 */
export function featuresFromConfig(config, t, type, options = {}) {
  const c = parseConfig(config)
  const L = faireLibelle({ libelles: options.libelles, t, langue: options.langue })
  const lignes = []
  const push = (cle, texte) => {
    if (type === 'artisan' && RESERVE_DESIGNER.has(cle)) return
    lignes.push({ cle, texte })
  }

  // Un quota à 0 veut dire « non inclus » : la ligne disparaît, au lieu
  // d'annoncer « 0 client par mois ».
  const inclus = (v) => v !== undefined && v !== 0
  const chiffre = (v) => inclus(v) && !estIllimite(v)

  /**
   * « Illimité » a sa PROPRE phrase, il ne s'injecte pas à la place du nombre.
   * Interpolé là où un chiffre est attendu, il donnait « illimité créations en
   * vitrine » — adjectif collé devant le nom et sans accord.
   */
  const quota = (base, v) => estIllimite(v) ? L(`${base}_illimite`) : L(base, v)

  if (inclus(c.max_creations_vitrine)) push('creations', quota('creations', c.max_creations_vitrine))
  push('galerie', c.visible_galerie ? L('galerie_oui') : L('galerie_non'))
  if (inclus(c.max_clients_par_mois)) push('clients', quota('clients', c.max_clients_par_mois))
  if (inclus(c.max_membres)) push('equipe', quota('equipe', c.max_membres))
  if (c.export_pdf) push('pdf', L('pdf'))

  // Le quota réel vaut mieux qu'un intitulé creux : « Photos VIP » ne dit rien,
  // « 15 photos mises en avant par mois » se comprend sans explication.
  if (c.photos_vip) {
    push('photos_vip', chiffre(c.max_photos_vip_par_mois)
      ? L('photos_vip_quota', c.max_photos_vip_par_mois)
      : L('photos_vip'))
  }
  if (c.facture_whatsapp) {
    push('factures_wa', chiffre(c.max_factures_par_mois)
      ? L('factures_wa_quota', c.max_factures_par_mois)
      : L('factures_wa'))
  }
  if (c.module_caisse) push('caisse', L('caisse'))
  if (c.facturation_normalisee) push('dgi', L('dgi'))
  if (c.multi_ateliers) {
    push('multi', chiffre(c.max_sous_ateliers)
      ? L('multi_quota', c.max_sous_ateliers)
      : L('multi'))
  }

  return lignes
}

/**
 * Un plan s'adresse-t-il à ce type de compte ?
 * `tous` (ou valeur absente, pour les plans antérieurs à la colonne) convient
 * à tout le monde.
 */
export function planPourType(plan, type) {
  const cible = plan?.type_compte || 'tous'
  return cible === 'tous' || cible === type
}
