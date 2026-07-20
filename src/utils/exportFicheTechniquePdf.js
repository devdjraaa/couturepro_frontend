import { T, enTete, section, paires, encart, esc } from './pdfTheme'
import { rendrePdf, nomFichier } from './pdfRendu'

/**
 * Fiche technique d'un modèle — V2 (refonte du 20/07).
 *
 * @param {object} item     modèle ({ nom, metadata })
 * @param {object} labels   libellés i18n { tissu, fournitures, cout_matiere, temps_confection, taille_base, instructions, titre_doc }
 * @param {string} atelierNom
 * @param {string|null} imgUrl  visuel du modèle (facultatif)
 */
export async function exportFicheTechniquePdf(item, labels, atelierNom = 'Gextimo', imgUrl = null) {
  const meta = item.metadata ?? {}

  const champs = ['tissu', 'fournitures', 'cout_matiere', 'temps_confection', 'taille_base']
    .filter((k) => meta[k])
    .map((k) => [labels[k] ?? k, meta[k]])

  // Le visuel accompagne la fiche sans la dominer : c'est un document d'atelier,
  // pas une planche de présentation.
  const visuel = imgUrl
    ? `<div style="margin-bottom:22px;border:1px solid ${T.filet};aspect-ratio:16/9;overflow:hidden;">
         <img src="${esc(imgUrl)}" crossorigin="anonymous"
              style="width:100%;height:100%;object-fit:cover;display:block;" />
       </div>`
    : ''

  const contenu =
    enTete({
      atelierNom,
      titre: labels.titre_doc ?? 'Fiche technique',
      sousTitre: item.nom ?? '',
    }) +
    visuel +
    (champs.length > 0
      ? section('Caractéristiques') + paires(champs)
      : '') +
    (meta.instructions
      ? encart(labels.instructions ?? 'Consignes de confection', meta.instructions)
      : '')

  return rendrePdf(contenu, nomFichier('fiche-technique', item.nom), {
    titre: `Fiche technique — ${item.nom ?? ''}`,
  })
}
