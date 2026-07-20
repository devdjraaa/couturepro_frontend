import { enTete, section, paires, encart } from './pdfTheme'
import { rendrePdf, nomFichier } from './pdfRendu'

/**
 * Fiche de mesures — V2 (refonte du 20/07).
 *
 * Composée avec les briques communes : identité, découpe multi-pages, filigrane
 * et pied de page sont gérés par `rendrePdf`. Ce fichier ne décide plus que du
 * CONTENU — c'est ce qui garantit que les 7 documents se ressemblent.
 */
export async function exportMesuresPdf(clientNom, mesures, atelierNom = 'Gextimo', unite = 'cm') {
  if (!mesures || Object.keys(mesures).length === 0) return

  const libelle = (cle) => {
    const t = String(cle).replace(/_/g, ' ')
    return t.charAt(0).toUpperCase() + t.slice(1)
  }

  const entrees = Object.entries(mesures)
    .filter(([cle, v]) => cle !== 'notes' && v !== null && v !== undefined && v !== '')
    .map(([cle, v]) => [libelle(cle), `${v} ${unite}`])

  if (entrees.length === 0) return

  const contenu =
    enTete({ atelierNom, titre: 'Fiche de mesures', sousTitre: clientNom }) +
    section('Mesures relevées') +
    paires(entrees) +
    (mesures.notes ? encart('Note de l\'atelier', mesures.notes) : '')

  return rendrePdf(contenu, nomFichier('mesures', clientNom), { titre: `Mesures de ${clientNom}` })
}
