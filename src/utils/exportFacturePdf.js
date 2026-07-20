import { T, enTete, section, tableau, pastille, esc } from './pdfTheme'
import { composerPdf, partagerOuTelecharger } from './pdfRendu'

const formatCFA = (v) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(Number(v) || 0) + ' FCFA'

const formatDate = (d) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

/**
 * En-tête — V2. Le mode « personnalisé » reste servi : l'atelier qui a fourni
 * son logo, son IFU et son RCCM doit continuer à les voir sur ses factures,
 * c'est une obligation légale (facture normalisée DGI), pas une décoration.
 */
function buildHeaderHtml({ atelier, factureSettings, ref, date, titre = 'Facture' }) {
  const personnalise   = factureSettings?.format_facture === 'personnalise'
  const atelierNom     = atelier?.nom     || factureSettings?.atelier_nom     || 'Gextimo'
  const atelierAdresse = atelier?.adresse || factureSettings?.atelier_adresse || ''
  const atelierVille   = atelier?.ville   || factureSettings?.atelier_ville   || ''

  const logo = personnalise ? factureSettings?.facture_logo_url : null
  const ifu  = personnalise ? factureSettings?.facture_ifu  : null
  const rccm = personnalise ? factureSettings?.facture_rccm : null

  const mentions = [
    [atelierAdresse, atelierVille].filter(Boolean).join(' · '),
    ifu  ? `IFU : ${esc(ifu)}`   : '',
    rccm ? `RCCM : ${esc(rccm)}` : '',
  ].filter(Boolean).join('<br>')

  const entete = enTete({
    atelierNom,
    titre,
    reference: ref,
    date: date ? new Date(date) : null,
  })

  const bloc = mentions
    ? `<p style="margin:-16px 0 22px;font:400 10px/1.5 ${T.sans};color:${T.gris};">${mentions}</p>`
    : ''

  // Le logo de l'atelier prend place à gauche de l'en-tête sans écraser la
  // composition commune : les documents restent reconnaissables entre eux.
  const avecLogo = logo
    ? `<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
         <img src="${esc(logo)}" crossorigin="anonymous"
              style="width:52px;height:52px;object-fit:contain;border:1px solid ${T.filet};" />
       </div>`
    : ''

  return avecLogo + entete + bloc
}

/** Bloc client. */
function buildClientHtml(client) {
  if (!client) return ''
  const nom = [client.prenom, client.nom].filter(Boolean).join(' ').trim() || client.nom || ''
  const infos = [client.telephone, client.email, client.adresse].filter(Boolean)

  return section('Facturé à') +
    `<p style="margin:0 0 2px;font:600 13px/1.3 ${T.sans};color:${T.encre};">${esc(nom)}</p>` +
    (infos.length
      ? `<p style="margin:0;font:400 11px/1.5 ${T.sans};color:${T.encreDoux};">${infos.map(esc).join(' · ')}</p>`
      : '')
}

/** Lignes de facture. */
function buildLignesHtml(lignes) {
  return section('Détail') + tableau({
    colonnes: [
      { titre: 'Désignation' },
      { titre: 'Qté', aligne: 'droite' },
      { titre: 'Prix unitaire', aligne: 'droite' },
      { titre: 'Montant', aligne: 'droite' },
    ],
    // Structure produite par les trois appelants : { designation, qte, pu, total }
    lignes: lignes.map(l => [
      l.designation ?? '',
      String(l.qte ?? 1),
      formatCFA(l.pu),
      formatCFA(l.total),
    ]),
  })
}

/** Totaux : c'est le seul endroit où le rouge de la charte est employé. */
function buildTotauxHtml({ total, acompte, reste }) {
  const entrees = [['Total', formatCFA(total)]]
  if (Number(acompte) > 0) {
    entrees.push(['Acompte versé', formatCFA(acompte)])
    entrees.push(['Reste à payer', formatCFA(reste)])
  }

  const solde = Number(reste) === 0
  const montantDu = solde ? total : reste

  return `<div style="margin-top:22px;padding-top:16px;border-top:1px solid ${T.encre};">
      <div style="display:flex;justify-content:flex-end;">
        <div style="min-width:250px;">
          ${entrees.map(([k, v], i) => `
            <div style="display:flex;justify-content:space-between;gap:20px;padding:5px 0;
                        font:${i === 0 ? '600' : '400'} 11.5px/1.3 ${T.sans};color:${T.encreDoux};">
              <span>${esc(k)}</span>
              <span style="font-variant-numeric:tabular-nums;color:${T.encre};">${esc(v)}</span>
            </div>`).join('')}
          <div style="display:flex;justify-content:space-between;gap:20px;align-items:baseline;
                      margin-top:9px;padding-top:9px;border-top:1px solid ${T.filet};">
            <span style="font:700 9px/1 ${T.sans};letter-spacing:.14em;text-transform:uppercase;color:${T.gris};">
              ${solde ? 'Montant réglé' : 'Net à payer'}
            </span>
            <span style="font:700 19px/1 ${T.sans};color:${T.rouge};font-variant-numeric:tabular-nums;">
              ${esc(formatCFA(montantDu))}
            </span>
          </div>
        </div>
      </div>
      <div style="margin-top:10px;text-align:right;">
        ${solde ? pastille('Soldée', 'valide') : pastille('En attente de règlement', 'attente')}
      </div>
    </div>`
}

/** Pied de page propre à la facture (mentions de l'atelier). */
function buildFooterHtml(factureSettings, { atelier, contact } = {}) {
  const personnalise = factureSettings?.format_facture === 'personnalise'
  const piedPage = personnalise ? factureSettings?.facture_pied_page : null
  const tel = contact?.telephone || atelier?.telephone

  const lignes = [piedPage, tel ? `Contact : ${tel}` : ''].filter(Boolean)
  if (lignes.length === 0) return ''

  return `<div style="margin-top:26px;padding-top:12px;border-top:1px solid ${T.filet};
                      font:400 10px/1.6 ${T.sans};color:${T.gris};text-align:center;">
      ${lignes.map(esc).join('<br>')}
    </div>`
}

/**
 * Rendu : passe par la mécanique commune (découpe multi-pages, filigrane, pied
 * de page). L'ancienne implémentation locale tronquait tout document dépassant
 * une page — une facture de plus de ~15 lignes perdait silencieusement sa fin.
 */
async function renderPdf(html) {
  return composerPdf(html)
}

const slug = (s) => String(s ?? 'client').trim().replace(/\s+/g, '-').toLowerCase() || 'client'

// Facture pour une seule commande (un type de vêtement)
export async function exportFacturePdf({ commande, items = [], client, atelier, factureSettings, contact }) {
  const ref = `F-${String(commande.id).slice(0, 8).toUpperCase()}`
  const c = client ?? commande.client

  const lignes = items.length > 0
    ? items.map(it => ({
        designation: it.vetement_nom ?? it.vetement?.nom ?? 'Article',
        qte: it.quantite ?? 1,
        pu: Number(it.prix_unitaire ?? 0),
        total: Number(it.quantite ?? 1) * Number(it.prix_unitaire ?? 0),
      }))
    : [{
        designation: commande.vetement_nom ?? commande.vetement?.nom ?? 'Article',
        qte: commande.quantite ?? 1,
        pu: Number(commande.prix ?? 0) / (commande.quantite || 1),
        total: Number(commande.prix ?? 0),
      }]

  const total   = lignes.reduce((s, l) => s + l.total, 0)
  const acompte = Number(commande.acompte ?? 0)
  const reste   = Math.max(0, total - acompte)

  const html = buildFactureHtml({
    atelier, factureSettings, ref, contact,
    date: formatDate(commande.date_commande ?? new Date()),
    client: c, lignes, total, acompte, reste,
    note: commande.description,
  })

  const pdf = await renderPdf(html)
  return { pdf, filename: `facture-${slug(c?.nom ?? c?.prenom)}-${ref}.pdf` }
}

// Facture consolidée pour une commande groupée (plusieurs types de vêtements)
export async function exportFactureGroupePdf({ groupe, atelier, factureSettings, contact }) {
  const ref = `G-${String(groupe.id).slice(0, 8).toUpperCase()}`
  const client = groupe.client

  const lignes = (groupe.commandes ?? []).map(c => ({
    designation: c.vetement_nom ?? c.vetement?.nom ?? 'Article',
    qte: c.quantite ?? 1,
    pu: Number(c.prix ?? 0) / (c.quantite || 1),
    total: Number(c.prix ?? 0),
  }))

  const total   = Number(groupe.total_general ?? lignes.reduce((s, l) => s + l.total, 0))
  const acompte = Number(groupe.acompte_total ?? 0)
  const reste   = Math.max(0, total - acompte)

  const html = buildFactureHtml({
    atelier, factureSettings, ref, contact,
    date: formatDate(groupe.created_at ?? new Date()),
    client, lignes, total, acompte, reste,
    note: groupe.note,
  })

  const pdf = await renderPdf(html)
  return { pdf, filename: `facture-groupee-${slug(client?.nom ?? client?.prenom)}-${ref}.pdf` }
}

// Devis / facture / reçu « simple » du module Facturation (modèle Facture).
const TITRES_DOC = { devis: 'DEVIS', facture: 'FACTURE', recu: 'REÇU' }

export async function exportFactureDocPdf({ facture, atelier, factureSettings, contact }) {
  const titre = TITRES_DOC[facture?.type] ?? 'FACTURE'
  const lignes = (facture?.lignes ?? []).map(l => ({
    designation: l.description ?? 'Article',
    qte: Number(l.quantite) || 1,
    pu: Number(l.prix_unitaire) || 0,
    total: (Number(l.quantite) || 1) * (Number(l.prix_unitaire) || 0),
  }))
  const total   = lignes.reduce((s, l) => s + l.total, 0)
  const acompte = Number(facture?.acompte) || 0
  const reste   = Math.max(0, total - acompte)

  const html = buildFactureHtml({
    atelier, factureSettings, contact,
    ref: facture?.numero ?? '',
    date: formatDate(facture?.date_emission ?? new Date()),
    client: { nom: facture?.client_nom, telephone: facture?.client_telephone },
    lignes, total, acompte, reste,
    note: facture?.notes,
    titre,
  })

  const pdf = await renderPdf(html)
  return { pdf, filename: `${facture?.type || 'facture'}-${slug(facture?.client_nom)}-${facture?.numero || ''}.pdf` }
}

// Télécharge le PDF, ou ouvre le partage natif (WhatsApp, Bluetooth, etc.) si disponible
export async function shareOrDownloadPdf(pdf, filename, { title = 'Facture', text = '' } = {}) {
  // Délègue à l'implémentation commune : il en existait deux, dont une sans
  // gestion de l'annulation utilisateur (le fichier se téléchargeait quand
  // même après un partage annulé).
  return partagerOuTelecharger(pdf, filename, { title, text })
}
