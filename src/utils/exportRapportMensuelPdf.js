import { enTete, section, paires, tableau } from './pdfTheme'
import { rendrePdf, nomFichier } from './pdfRendu'

/** Rapport mensuel — V2 (refonte du 20/07). */

const fcfa = (v) => new Intl.NumberFormat('fr-FR').format(Number(v) || 0) + ' F'

const modeLabel = (mode) =>
  ({ mobile_money: 'Mobile Money', virement: 'Virement', especes: 'Espèces' })[mode] ?? mode

export async function exportRapportMensuelPdf(data) {
  const clientes = data.par_cliente ?? []

  const modes = Object.entries(data.modes_paiement ?? {})
    .filter(([, v]) => Number(v) > 0)
    .map(([cle, v]) => [modeLabel(cle), fcfa(v)])

  const contenu =
    enTete({
      atelierNom: data.atelier ?? 'Gextimo',
      titre: 'Rapport mensuel',
      sousTitre: data.mois ?? '',
    }) +

    section('Activité du mois') +
    paires([
      ['Total encaissé',  fcfa(data.total_encaisse)],
      ['Total facturé',   fcfa(data.total_facture)],
      ['Commandes',       String(data.nb_commandes ?? 0)],
      ['Paiements reçus', String(data.nb_paiements ?? 0)],
    ]) +

    (modes.length > 0
      ? section('Répartition par moyen de paiement') + paires(modes)
      : '') +

    (clientes.length > 0
      ? section(`Détail par cliente (${clientes.length})`) +
        tableau({
          colonnes: [
            { titre: 'Cliente' },
            { titre: 'Commandes', aligne: 'droite' },
            { titre: 'Encaissé', aligne: 'droite' },
          ],
          lignes: clientes.map((c) => [
            c.nom ?? '—',
            String(c.nb_commandes ?? 0),
            fcfa(c.total ?? c.total_encaisse ?? 0),
          ]),
          total: { libelle: 'Total du mois', valeur: fcfa(data.total_encaisse) },
        })
      : section('Détail par cliente') +
        `<p style="margin:0;font:400 11.5px/1.5 sans-serif;color:#8A817B;">
           Aucune activité enregistrée sur la période.
         </p>`)

  return rendrePdf(contenu, nomFichier('rapport-mensuel', data.mois), {
    titre: `Rapport mensuel — ${data.mois ?? ''}`,
  })
}
