import { enTete, section, paires, tableau, pastille } from './pdfTheme'
import { rendrePdf, nomFichier } from './pdfRendu'

/** Relevé de paiements d'une commande — V2 (refonte du 20/07). */

const fcfa = (v) => new Intl.NumberFormat('fr-FR').format(Number(v) || 0) + ' F'

const jour = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

const modeLabel = (mode) =>
  ({ mobile_money: 'Mobile Money', virement: 'Virement', especes: 'Espèces' })[mode] ?? mode

export async function exportRelevePdf({ commande, paiements = [], clientNom, atelierNom = 'Gextimo' }) {
  const total   = Number(commande.prix ?? 0)
  const verse   = Number(commande.acompte ?? 0)
  const reste   = Math.max(0, total - verse)
  const ref     = String(commande.id).slice(0, 8).toUpperCase()
  const solde   = reste === 0

  const contenu =
    enTete({
      atelierNom,
      titre: 'Relevé de paiements',
      sousTitre: clientNom,
      reference: `CMD-${ref}`,
    }) +
    `<div style="margin-bottom:2px;">${
      solde ? pastille('Soldée', 'valide') : pastille('Reste à payer', 'attente')
    }</div>` +

    section('Situation') +
    paires([
      ['Montant total', fcfa(total)],
      ['Déjà versé',    fcfa(verse)],
      ['Reste à payer', fcfa(reste)],
      ['Statut',        solde ? 'Soldée' : 'En cours de règlement'],
    ]) +

    (paiements.length > 0
      ? section('Versements enregistrés') +
        tableau({
          colonnes: [
            { titre: 'Date' },
            { titre: 'Moyen' },
            { titre: 'Montant', aligne: 'droite' },
          ],
          lignes: paiements.map((p) => [
            jour(p.created_at ?? p.date),
            modeLabel(p.mode_paiement),
            fcfa(p.montant),
          ]),
          total: { libelle: 'Total versé', valeur: fcfa(verse) },
        })
      // Un relevé sans versement doit le DIRE : un tableau absent laissait
      // croire à un défaut d'affichage.
      : section('Versements enregistrés') +
        `<p style="margin:0;font:400 11.5px/1.5 sans-serif;color:#8A817B;">
           Aucun versement enregistré à ce jour.
         </p>`)

  return rendrePdf(contenu, nomFichier('releve', clientNom, ref), {
    titre: `Relevé — ${clientNom}`,
  })
}
