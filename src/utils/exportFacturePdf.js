import { T, enTete, section, tableau, pastille, encart, esc } from './pdfTheme'
import { composerPdf, partagerOuTelecharger } from './pdfRendu'
import { formatCurrency, deviseDe, chargerDevises } from './formatCurrency'

/**
 * CLI-1 — les montants suivent la devise de l'atelier, plus « FCFA » en dur.
 *
 * Une facture est un document qui porte de l'argent : afficher le franc CFA à
 * un atelier ghanéen était faux, et le nombre de décimales figé à zéro
 * arrondissait ses montants à l'unité.
 */
const formatMontant = (v, devise) => formatCurrency(Number(v) || 0, devise)

/**
 * En-tête — V2. Le mode « personnalisé » reste servi : l'atelier qui a fourni
 * son logo, son IFU et son RCCM doit continuer à les voir sur ses factures,
 * c'est une obligation légale (facture normalisée DGI), pas une décoration.
 */
function buildHeaderHtml({ atelier, factureSettings, contact, ref, date, titre = 'Facture' }) {
  const personnalise   = factureSettings?.format_facture === 'personnalise'
  // JAMAIS « Gextimo » en repli : la facture est émise par l'ATELIER, pas par
  // la plateforme. Quand l'atelier n'était pas chargé, le document sortait au
  // nom de Gextimo — un client recevait une facture de la mauvaise entreprise.
  const atelierNom     = atelier?.nom     || factureSettings?.atelier_nom     || ''
  const atelierAdresse = atelier?.adresse || factureSettings?.atelier_adresse || ''
  const atelierVille   = atelier?.ville   || factureSettings?.atelier_ville   || ''
  // Le numéro figure désormais EN HAUT, avec l'identité de l'atelier : c'est là
  // qu'on cherche qui contacter, pas au bas de la dernière page.
  const atelierTel     = contact?.telephone || atelier?.telephone || factureSettings?.atelier_telephone || ''

  const logo = personnalise ? factureSettings?.facture_logo_url : null
  const ifu  = personnalise ? factureSettings?.facture_ifu  : null
  const rccm = personnalise ? factureSettings?.facture_rccm : null

  const mentions = [
    [atelierAdresse, atelierVille].filter(Boolean).join(' · '),
    atelierTel ? `Tél. : ${esc(atelierTel)}` : '',
    ifu  ? `IFU : ${esc(ifu)}`   : '',
    rccm ? `RCCM : ${esc(rccm)}` : '',
  ].filter(Boolean).join('<br>')

  const entete = enTete({
    atelierNom,
    titre,
    reference: ref,
    // La date est transmise BRUTE. Elle arrivait déjà formatée en français
    // (« 23 juillet 2026 ») et était repassée dans `new Date()`, que JavaScript
    // ne sait pas relire : le PDF imprimait « Invalid Date ».
    date,
    avecHeure: true,
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
function buildLignesHtml(lignes, devise) {
  /**
   * Deux vocabulaires coexistent : les exports PDF traduisent en
   * { designation, qte, pu, total }, tandis que le formulaire de facturation
   * manipule { description, quantite, prix_unitaire }. L'aperçu passait ses
   * lignes SANS traduire — chaque ligne sortait donc vide, à 0, alors que le
   * total (calculé ailleurs) restait juste : un document parfaitement crédible
   * et entièrement faux.
   *
   * On accepte les deux formes ici. Sur un document qui porte de l'argent, une
   * clé mal nommée ne doit pas se solder par un zéro silencieux.
   */
  const norm = (l) => {
    const qte = Number(l.qte ?? l.quantite ?? 1) || 0
    const pu  = Number(l.pu ?? l.prix_unitaire ?? 0) || 0
    return {
      designation: l.designation ?? l.description ?? '',
      qte,
      pu,
      total: Number(l.total ?? qte * pu) || 0,
    }
  }

  return section('Détail') + tableau({
    colonnes: [
      { titre: 'Désignation' },
      { titre: 'Qté', aligne: 'droite' },
      { titre: 'Prix unitaire', aligne: 'droite' },
      { titre: 'Montant', aligne: 'droite' },
    ],
    lignes: lignes.map(norm).map(l => [
      l.designation,
      String(l.qte),
      formatMontant(l.pu, devise),
      formatMontant(l.total, devise),
    ]),
  })
}

/** Totaux : c'est le seul endroit où le rouge de la charte est employé. */
function buildTotauxHtml({ total, acompte, reste, devise }) {
  const entrees = [['Total', formatMontant(total, devise)]]
  if (Number(acompte) > 0) {
    entrees.push(['Acompte versé', formatMontant(acompte, devise)])
    entrees.push(['Reste à payer', formatMontant(reste, devise)])
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
              ${esc(formatMontant(montantDu, devise))}
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
/**
 * Assemble le document à partir des briques ci-dessus.
 *
 * Cette fonction avait DISPARU lors de la refonte de charte (95ddc42) alors que
 * ses trois appels subsistaient : générer une facture, un devis ou un reçu
 * levait « buildFactureHtml is not defined ». Le build ne dit rien de ce genre
 * de manque — seul `no-undef` le voyait, et il n'était pas contrôlé.
 */
/**
 * Aperçu HTML d'une facture AVANT émission.
 *
 * Réutilise `buildFactureHtml` — le MÊME rendu que le PDF final. Un aperçu qui
 * dessinerait le document autrement mentirait : on verrait une chose, on
 * émettrait l'autre. Les devises sont chargées d'abord, sinon le premier aperçu
 * d'une session sortirait au symbole de repli.
 *
 * `enveloppe` place le fragment dans une page A4 blanche, pour un rendu fidèle
 * dans une iframe d'aperçu.
 */
export async function apercuFactureHtml({ atelier, factureSettings, contact, date, client, lignes, total, acompte, reste, note, titre }) {
  await pret()
  const corps = buildFactureHtml({
    atelier, factureSettings, ref: '—', contact, date,
    client, lignes, total, acompte, reste, note, titre,
  })
  return `<!doctype html><html><head><meta charset="utf-8">
    <style>
      *{box-sizing:border-box}
      body{margin:0;background:#f3f4f6;font-family:Inter,system-ui,sans-serif;padding:16px}
      .page{background:#fff;max-width:780px;margin:0 auto;padding:32px;box-shadow:0 2px 16px rgba(0,0,0,.08);border-radius:8px}
    </style></head><body><div class="page">${corps}</div></body></html>`
}

function buildFactureHtml({ atelier, factureSettings, ref, contact, date, client, lignes, total, acompte, reste, note, titre = 'Facture' }) {
  const devise = deviseDe(atelier)

  return [
    buildHeaderHtml({ atelier, factureSettings, contact, ref, date, titre }),
    buildClientHtml(client),
    buildLignesHtml(lignes, devise),
    buildTotauxHtml({ total, acompte, reste, devise }),
    note ? encart('Note', note) : '',
    buildFooterHtml(factureSettings, { atelier, contact }),
  ].join('')
}

async function renderPdf(html) {
  return composerPdf(html)
}

/**
 * Le référentiel des devises doit être en mémoire AVANT de composer le
 * document : le formatage est synchrone, et sans cette attente la première
 * facture d'une session sortirait avec le symbole de repli — c'est-à-dire en
 * francs CFA pour un atelier qui n'y est pas.
 */
async function pret() {
  await chargerDevises()
}

const slug = (s) => String(s ?? 'client').trim().replace(/\s+/g, '-').toLowerCase() || 'client'

// Facture pour une seule commande (un type de vêtement)
export async function exportFacturePdf({ commande, items = [], client, atelier, factureSettings, contact }) {
  await pret()
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
    date: commande.date_commande ?? new Date(),
    client: c, lignes, total, acompte, reste,
    note: commande.description,
  })

  const pdf = await renderPdf(html)
  return { pdf, filename: `facture-${slug(c?.nom ?? c?.prenom)}-${ref}.pdf` }
}

// Facture consolidée pour une commande groupée (plusieurs types de vêtements)
export async function exportFactureGroupePdf({ groupe, atelier, factureSettings, contact }) {
  await pret()
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
    date: groupe.created_at ?? new Date(),
    client, lignes, total, acompte, reste,
    note: groupe.note,
  })

  const pdf = await renderPdf(html)
  return { pdf, filename: `facture-groupee-${slug(client?.nom ?? client?.prenom)}-${ref}.pdf` }
}

// Devis / facture / reçu « simple » du module Facturation (modèle Facture).
const TITRES_DOC = { devis: 'DEVIS', facture: 'FACTURE', recu: 'REÇU' }

export async function exportFactureDocPdf({ facture, atelier, factureSettings, contact }) {
  await pret()
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
    date: facture?.date_emission ?? new Date(),
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
