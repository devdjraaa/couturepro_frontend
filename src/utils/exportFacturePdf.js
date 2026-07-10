import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import QRCode from 'qrcode'
import { IS_NATIVE } from '@/constants/routes'

const formatCFA = (v) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(Number(v) || 0) + ' FCFA'

const formatDate = (d) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

function buildHeaderHtml({ atelier, factureSettings, ref, date, titre = 'FACTURE' }) {
  const personnalise = factureSettings?.format_facture === 'personnalise'
  const atelierNom    = atelier?.nom    || factureSettings?.atelier_nom    || 'Gextimo'
  const atelierAdresse = atelier?.adresse || factureSettings?.atelier_adresse || ''
  const atelierVille   = atelier?.ville   || factureSettings?.atelier_ville   || ''
  const adresseLigne   = [atelierAdresse, atelierVille].filter(Boolean).join(', ')

  if (personnalise) {
    const logo = factureSettings?.facture_logo_url
    const ifu  = factureSettings?.facture_ifu
    const rccm = factureSettings?.facture_rccm

    return `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 24px;">
        <div style="display:flex; align-items:center; gap:12px;">
          ${logo ? `<img src="${logo}" crossorigin="anonymous" style="width:56px;height:56px;object-fit:contain;border-radius:8px;border:1px solid #e5e7eb;" />` : ''}
          <div>
            <p style="font-size:15px;font-weight:bold;margin:0;color:#111827;">${atelierNom}</p>
            ${adresseLigne ? `<p style="font-size:10px;color:#6b7280;margin:2px 0 0;">${adresseLigne}</p>` : ''}
            ${ifu  ? `<p style="font-size:10px;color:#6b7280;margin:2px 0 0;">IFU : ${ifu}</p>`   : ''}
            ${rccm ? `<p style="font-size:10px;color:#6b7280;margin:1px 0 0;">RCCM : ${rccm}</p>` : ''}
          </div>
        </div>
        <div style="text-align:right;">
          <h1 style="font-size:22px;font-weight:bold;margin:0;color:#111827;">${titre}</h1>
          <p style="font-size:11px;color:#6b7280;margin:4px 0 0;">N° ${ref}</p>
          <p style="font-size:11px;color:#6b7280;margin:2px 0 0;">${date}</p>
        </div>
      </div>
    `
  }

  return `
    <div style="border-bottom: 2px solid #6d28d9; padding-bottom: 12px; margin-bottom: 24px;">
      <p style="font-size: 11px; color: #7c3aed; font-weight: 600; margin: 0 0 4px;">${atelierNom}</p>
      <h1 style="font-size: 20px; font-weight: bold; margin: 0;">${titre}</h1>
      <p style="font-size: 13px; color: #555; margin: 4px 0 0;">N° ${ref}</p>
      <p style="font-size: 11px; color: #888; margin: 4px 0 0;">${date}${adresseLigne ? ' · ' + adresseLigne : ''}</p>
    </div>
  `
}

function buildClientHtml(client) {
  if (!client) return ''
  const nom = `${client.prenom ?? ''} ${client.nom ?? ''}`.trim() || client.nom_complet || 'Client'
  return `
    <div style="margin-bottom: 18px;">
      <p style="font-size: 9px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 4px;">Facturé à</p>
      <p style="font-size: 13px; font-weight: 600; margin: 0; color: #111827;">${nom}</p>
      ${client.telephone ? `<p style="font-size: 11px; color: #6b7280; margin: 2px 0 0;">${client.telephone}</p>` : ''}
    </div>
  `
}

function buildLignesHtml(lignes) {
  return `
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px;">
      <thead>
        <tr style="background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
          <th style="text-align: left; padding: 8px 10px; color: #6b7280; font-weight: 600;">Désignation</th>
          <th style="text-align: center; padding: 8px 10px; color: #6b7280; font-weight: 600;">Qté</th>
          <th style="text-align: right; padding: 8px 10px; color: #6b7280; font-weight: 600;">P.U.</th>
          <th style="text-align: right; padding: 8px 10px; color: #6b7280; font-weight: 600;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${lignes.map(l => `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 10px; color: #374151;">${l.designation}</td>
            <td style="padding: 8px 10px; text-align: center; color: #374151;">${l.qte}</td>
            <td style="padding: 8px 10px; text-align: right; font-family: monospace; color: #374151;">${formatCFA(l.pu)}</td>
            <td style="padding: 8px 10px; text-align: right; font-family: monospace; font-weight: 600;">${formatCFA(l.total)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

function buildTotauxHtml({ total, acompte, reste }) {
  return `
    <div style="display: flex; justify-content: flex-end; margin-bottom: 28px;">
      <div style="width: 240px;">
        <div style="display: flex; justify-content: space-between; padding: 6px 0;">
          <span style="font-size: 12px; color: #6b7280;">Total</span>
          <span style="font-size: 13px; font-weight: 600; font-family: monospace;">${formatCFA(total)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0;">
          <span style="font-size: 12px; color: #6b7280;">Acompte versé</span>
          <span style="font-size: 13px; font-weight: 600; font-family: monospace; color: #059669;">${formatCFA(acompte)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #e5e7eb; margin-top: 4px;">
          <span style="font-size: 13px; font-weight: 700; color: #111827;">Solde dû</span>
          <span style="font-size: 15px; font-weight: 800; font-family: monospace; color: ${reste > 0 ? '#ea580c' : '#059669'};">${formatCFA(reste)}</span>
        </div>
      </div>
    </div>
  `
}

function buildFooterHtml(factureSettings) {
  const personnalise = factureSettings?.format_facture === 'personnalise'
  const piedPage = factureSettings?.facture_pied_page

  return `
    ${piedPage ? `<p style="font-size: 11px; color: #4b5563; white-space: pre-wrap; border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 8px;">${piedPage}</p>` : ''}
    <p style="margin-top: 24px; font-size: 10px; color: #bbb; text-align: center;">
      ${personnalise ? 'Facture générée via Gextimo' : 'Document généré par Gextimo — facture standard'}
    </p>
  `
}

// Sceau de normalisation e-MECeF (code MECeF/DGI + QR) imprimé sur la facture.
function buildDgiHtml(dgi) {
  if (!dgi?.code) return ''
  return `
    <div style="margin: 8px 0 16px; border: 1.5px solid #D00B0B; border-radius: 10px; padding: 14px 16px; display: flex; gap: 16px; align-items: center;">
      ${dgi.qrDataUrl ? `<img src="${dgi.qrDataUrl}" alt="QR e-MECeF" style="width: 92px; height: 92px; flex-shrink: 0;" />` : ''}
      <div style="min-width: 0;">
        <p style="font-size: 12px; font-weight: 800; color: #D00B0B; margin: 0 0 5px;">FACTURE NORMALISÉE e-MECeF · DGI Bénin</p>
        <p style="font-size: 12px; color: #111; margin: 0; font-family: monospace;"><strong>Code MECeF/DGI :</strong> ${dgi.code}</p>
        <p style="font-size: 10px; color: #6b7280; margin: 6px 0 0;">Vérification : sygmef.impots.bj — saisir le code MECeF/DGI ci-dessus.</p>
      </div>
    </div>
  `
}

function buildFactureHtml({ atelier, factureSettings, ref, date, client, lignes, total, acompte, reste, note, titre, dgi }) {
  return `
    ${buildHeaderHtml({ atelier, factureSettings, ref, date, titre })}
    ${buildClientHtml(client)}
    ${buildLignesHtml(lignes)}
    ${buildTotauxHtml({ total, acompte, reste })}
    ${note ? `<p style="font-size: 11px; color: #6b7280; margin-bottom: 16px;"><strong>Note :</strong> ${note}</p>` : ''}
    ${buildFooterHtml(factureSettings)}
    ${buildDgiHtml(dgi)}
  `
}

// Génère l'image QR (data URL) à partir du contenu QR e-MECeF, si la facture est normalisée.
async function buildDgiData(facture) {
  if (!facture?.emecef_code) return null
  let qrDataUrl = ''
  const contenu = facture.qr_code_url || facture.emecef_qr_url
  if (contenu) {
    try { qrDataUrl = await QRCode.toDataURL(String(contenu), { width: 200, margin: 1 }) }
    catch { /* QR indisponible : on imprime au moins le code */ }
  }
  return { code: facture.emecef_code, qrDataUrl }
}

async function renderPdf(html) {
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: 595px; padding: 40px;
    font-family: sans-serif;
    background: #ffffff; color: #111;
  `
  container.innerHTML = html
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const ratio = pageW / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, canvas.height * ratio)
    return pdf
  } finally {
    document.body.removeChild(container)
  }
}

const slug = (s) => String(s ?? 'client').trim().replace(/\s+/g, '-').toLowerCase() || 'client'

// Facture pour une seule commande (un type de vêtement)
export async function exportFacturePdf({ commande, items = [], client, atelier, factureSettings }) {
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
    atelier, factureSettings, ref,
    date: formatDate(commande.date_commande ?? new Date()),
    client: c, lignes, total, acompte, reste,
    note: commande.description,
  })

  const pdf = await renderPdf(html)
  return { pdf, filename: `facture-${slug(c?.nom ?? c?.prenom)}-${ref}.pdf` }
}

// Facture consolidée pour une commande groupée (plusieurs types de vêtements)
export async function exportFactureGroupePdf({ groupe, atelier, factureSettings }) {
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
    atelier, factureSettings, ref,
    date: formatDate(groupe.created_at ?? new Date()),
    client, lignes, total, acompte, reste,
    note: groupe.note,
  })

  const pdf = await renderPdf(html)
  return { pdf, filename: `facture-groupee-${slug(client?.nom ?? client?.prenom)}-${ref}.pdf` }
}

// Devis / facture / reçu « simple » du module Facturation (modèle Facture).
const TITRES_DOC = { devis: 'DEVIS', facture: 'FACTURE', recu: 'REÇU' }

export async function exportFactureDocPdf({ facture, atelier, factureSettings }) {
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
  const dgi     = await buildDgiData(facture)

  const html = buildFactureHtml({
    atelier, factureSettings,
    ref: facture?.numero ?? '',
    date: formatDate(facture?.date_emission ?? new Date()),
    client: { nom: facture?.client_nom, telephone: facture?.client_telephone },
    lignes, total, acompte, reste,
    note: facture?.notes,
    titre, dgi,
  })

  const pdf = await renderPdf(html)
  return { pdf, filename: `${facture?.type || 'facture'}-${slug(facture?.client_nom)}-${facture?.numero || ''}.pdf` }
}

// Télécharge le PDF, ou ouvre le partage natif (WhatsApp, Bluetooth, etc.) si disponible
export async function shareOrDownloadPdf(pdf, filename, { title = 'Facture', text = '' } = {}) {
  // Chemin natif (app Capacitor) : le WebView Android n'a NI navigator.share NI un
  // gestionnaire de téléchargement pour pdf.save() → le PDF ne sortait pas.
  // On écrit le fichier via Filesystem puis on ouvre le partage natif (Share plugin).
  if (IS_NATIVE) {
    try {
      const [{ Filesystem, Directory }, { Share }] = await Promise.all([
        import('@capacitor/filesystem'),
        import('@capacitor/share'),
      ])
      const base64 = pdf.output('datauristring').split(',')[1]
      const safeName = (filename || 'facture.pdf').replace(/[^\w.\-]+/g, '_')
      const { uri } = await Filesystem.writeFile({
        path: safeName,
        data: base64,
        directory: Directory.Cache,
      })
      await Share.share({ title, text, files: [uri] })
      return 'shared'
    } catch (e) {
      if (e?.message && /cancel/i.test(e.message)) return 'cancelled'
      // dernier recours : on tente la voie navigateur ci-dessous
    }
  }
  if (typeof navigator !== 'undefined' && navigator.canShare) {
    try {
      const file = new File([pdf.output('blob')], filename, { type: 'application/pdf' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title, text })
        return 'shared'
      }
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled'
    }
  }
  pdf.save(filename)
  return 'downloaded'
}
