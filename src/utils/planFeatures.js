/**
 * Traduit la configuration d'un plan en lignes lisibles.
 *
 * SOURCE UNIQUE, volontairement. La page de tarifs et l'offre d'abonnement dans
 * l'application décrivaient les mêmes plans avec deux listes écrites à la main
 * et deux vocabulaires distincts : un même plan ne se lisait pas pareil aux deux
 * endroits, et une clé ajoutée en administration n'apparaissait ni sur l'une ni
 * sur l'autre.
 *
 * Ici, le TEXTE DÉCOULE DE LA VALEUR : la direction saisit 7 sous-ateliers en
 * administration, les deux écrans affichent « Jusqu'à 7 ateliers
 * supplémentaires ». Rien à retoucher dans le code pour qu'un changement de
 * quota se voie.
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
 * @param {object|string} config — le `config` du plan, tel que servi par l'API
 * @param {Function} t — la fonction de traduction
 * @param {string} [type] — 'artisan' pour masquer les lignes designer
 * @returns {{cle: string, texte: string}[]}
 */
export function featuresFromConfig(config, t, type) {
  const c = parseConfig(config)
  const lignes = []
  const push = (cle, texte) => {
    if (type === 'artisan' && RESERVE_DESIGNER.has(cle)) return
    lignes.push({ cle, texte })
  }

  /**
   * « Illimité » a sa PROPRE phrase, il ne s'injecte pas à la place du nombre.
   * Interpolé là où un chiffre est attendu, il donnait « illimité créations en
   * vitrine » — adjectif collé devant le nom et sans accord.
   */
  const quota = (base, valeur) =>
    estIllimite(valeur)
      ? t(`premium.feat.${base}_illimite`)
      : t(`premium.feat.${base}`, { n: valeur, count: Number(valeur) })

  // Un quota à 0 veut dire « non inclus » : la ligne ne s'affiche pas du tout,
  // plutôt que d'annoncer « 0 client par mois ».
  const inclus = (v) => v !== undefined && v !== 0

  if (inclus(c.max_creations_vitrine)) push('creations', quota('creations', c.max_creations_vitrine))
  push('galerie', c.visible_galerie ? t('premium.feat.galerie_oui') : t('premium.feat.galerie_non'))
  if (inclus(c.max_clients_par_mois)) push('clients', quota('clients', c.max_clients_par_mois))
  if (inclus(c.max_membres)) {
    push('equipe', estIllimite(c.max_membres)
      ? t('premium.feat.equipe_illimite')
      : t('premium.feat.equipe', { n: c.max_membres, count: Number(c.max_membres) }))
  }
  if (c.export_pdf) push('pdf', t('premium.feat.pdf'))

  // Le quota réel vaut mieux qu'un intitulé creux : « Photos VIP » ne dit rien,
  // « 15 photos mises en avant par mois » se comprend sans explication.
  if (c.photos_vip) {
    push('photos_vip', inclus(c.max_photos_vip_par_mois) && !estIllimite(c.max_photos_vip_par_mois)
      ? t('premium.feat.photos_vip_quota', { n: c.max_photos_vip_par_mois, count: Number(c.max_photos_vip_par_mois) })
      : t('premium.feat.photos_vip'))
  }
  if (c.facture_whatsapp) {
    push('factures_wa', inclus(c.max_factures_par_mois) && !estIllimite(c.max_factures_par_mois)
      ? t('premium.feat.factures_wa_quota', { n: c.max_factures_par_mois, count: Number(c.max_factures_par_mois) })
      : t('premium.feat.factures_wa'))
  }
  if (c.module_caisse) push('caisse', t('premium.feat.caisse'))
  if (c.facturation_normalisee) push('dgi', t('premium.feat.dgi'))
  if (c.multi_ateliers) {
    push('multi', inclus(c.max_sous_ateliers) && !estIllimite(c.max_sous_ateliers)
      ? t('premium.feat.multi_quota', { n: c.max_sous_ateliers, count: Number(c.max_sous_ateliers) })
      : t('premium.feat.multi'))
  }

  return lignes
}
