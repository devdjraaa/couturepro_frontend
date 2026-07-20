import { enTete, section, paires, tableau } from './pdfTheme'
import { rendrePdf, nomFichier } from './pdfRendu'

/** Rapport de caisse — V2 (refonte du 20/07). */

const fcfa = (v) => new Intl.NumberFormat('fr-FR').format(Number(v) || 0) + ' F'

const modeLabel = (mode) =>
  ({ mobile_money: 'Mobile Money', virement: 'Virement', especes: 'Espèces' })[mode] ?? mode

export async function exportRapportCaissePdf({ stats, clients = [], atelierNom = 'Gextimo' }) {
  const debiteurs = clients.filter((c) => Number(c.solde_restant) > 0)

  const modes = Object.entries(stats.modes_paiement ?? {})
    .filter(([, v]) => Number(v) > 0)
    .map(([cle, v]) => [modeLabel(cle), fcfa(v)])

  const contenu =
    enTete({
      atelierNom,
      titre: 'Rapport de caisse',
      sousTitre: stats.mois ?? '',
    }) +

    section('Synthèse') +
    paires([
      ['Total encaissé',      fcfa(stats.total_encaisse)],
      ['En attente',          fcfa(stats.total_en_attente)],
      ['Commandes soldées',   String(stats.nb_commandes_soldees ?? 0)],
      ['Commandes en cours',  String(stats.nb_commandes_en_cours ?? 0)],
    ]) +

    (modes.length > 0
      ? section('Répartition par moyen de paiement') + paires(modes)
      : '') +

    (debiteurs.length > 0
      ? section(`Soldes clients (${debiteurs.length} débiteur${debiteurs.length > 1 ? 's' : ''})`) +
        tableau({
          colonnes: [
            { titre: 'Client' },
            { titre: 'Versé', aligne: 'droite' },
            { titre: 'Reste à payer', aligne: 'droite' },
          ],
          lignes: debiteurs.map((c) => [
            c.nom ?? [c.prenom, c.nom].filter(Boolean).join(' '),
            fcfa(c.total_verse ?? 0),
            fcfa(c.solde_restant),
          ]),
          total: {
            libelle: 'Total dû',
            valeur: fcfa(debiteurs.reduce((s, c) => s + Number(c.solde_restant || 0), 0)),
          },
        })
      // Dire explicitement qu'il n'y a aucun impayé : une section absente
      // ressemble à un bug d'affichage.
      : section('Soldes clients') +
        `<p style="margin:0;font:400 11.5px/1.5 sans-serif;color:#8A817B;">
           Aucun solde en attente. Toutes les commandes de la période sont réglées.
         </p>`)

  return rendrePdf(contenu, nomFichier('caisse', stats.mois), {
    titre: `Rapport de caisse — ${stats.mois ?? ''}`,
  })
}
