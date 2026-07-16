import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { shareOrSavePdf } from './shareNative'

const fmt = (v) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(Number(v) || 0) + ' FCFA'

const modeLabel = (m) =>
  ({ especes: 'Espèces', mobile_money: 'Mobile Money', virement: 'Virement' })[m] ?? m

/**
 * PL-3 : rapport PDF mensuel — synthèse globale + encaissements du mois PAR CLIENTE.
 * Alimenté par GET /caisse/rapport-mensuel.
 * @param {object} data     réponse de l'API rapport mensuel
 */
export async function exportRapportMensuelPdf(data) {
  const mois = data.mois ?? ''
  const [annee, num] = mois.split('-')
  const moisLabel = num
    ? new Date(Number(annee), Number(num) - 1, 1)
        .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : mois

  const modesHtml = Object.entries(data.modes_paiement ?? {})
    .map(([mode, total]) =>
      `<tr>
        <td style="padding:4px 0;color:#555;">${modeLabel(mode)}</td>
        <td style="padding:4px 0;text-align:right;font-weight:600;">${fmt(total)}</td>
      </tr>`
    ).join('')

  const clientesHtml = (data.par_cliente ?? [])
    .map((c, i) =>
      `<tr style="background:${i % 2 === 0 ? '#f9f9f9' : '#fff'}">
        <td style="padding:5px 8px;">${c.client}</td>
        <td style="padding:5px 8px;text-align:right;">${c.nb_commandes}</td>
        <td style="padding:5px 8px;text-align:right;">${c.nb_paiements}</td>
        <td style="padding:5px 8px;text-align:right;color:#15803d;font-weight:600;">${fmt(c.encaisse)}</td>
      </tr>`
    ).join('')

  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: 680px; padding: 40px;
    font-family: sans-serif; font-size: 13px;
    background: #ffffff; color: #111;
  `

  container.innerHTML = `
    <div style="border-bottom: 2px solid #6d28d9; padding-bottom: 12px; margin-bottom: 24px;">
      <p style="font-size: 11px; color: #7c3aed; font-weight: 600; margin: 0 0 4px;">${data.atelier ?? 'Gextimo'}</p>
      <h1 style="font-size: 22px; font-weight: bold; margin: 0;">Rapport mensuel</h1>
      <p style="font-size: 13px; color: #555; margin: 4px 0 0; text-transform: capitalize;">${moisLabel}</p>
      <p style="font-size: 11px; color: #aaa; margin: 4px 0 0;">Généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:28px;">
      <div style="background:#f0fdf4;border-radius:10px;padding:14px;">
        <p style="font-size:11px;color:#16a34a;font-weight:600;margin:0 0 4px;">Encaissé ce mois</p>
        <p style="font-size:18px;font-weight:bold;color:#15803d;margin:0;">${fmt(data.total_encaisse)}</p>
      </div>
      <div style="background:#f5f3ff;border-radius:10px;padding:14px;">
        <p style="font-size:11px;color:#7c3aed;font-weight:600;margin:0 0 4px;">Facturé ce mois</p>
        <p style="font-size:18px;font-weight:bold;color:#6d28d9;margin:0;">${fmt(data.total_facture)}</p>
      </div>
      <div style="background:#eff6ff;border-radius:10px;padding:14px;">
        <p style="font-size:11px;color:#2563eb;font-weight:600;margin:0 0 4px;">Commandes / Paiements</p>
        <p style="font-size:18px;font-weight:bold;color:#1d4ed8;margin:0;">${data.nb_commandes} / ${data.nb_paiements}</p>
      </div>
    </div>

    ${modesHtml ? `
    <h2 style="font-size:14px;font-weight:600;margin:0 0 10px;">Encaissements par mode</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      ${modesHtml}
    </table>` : ''}

    <h2 style="font-size:14px;font-weight:600;margin:0 0 10px;">Détail par cliente (${(data.par_cliente ?? []).length})</h2>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#6d28d9;color:#fff;">
          <th style="padding:6px 8px;text-align:left;font-size:12px;">Cliente</th>
          <th style="padding:6px 8px;text-align:right;font-size:12px;">Commandes</th>
          <th style="padding:6px 8px;text-align:right;font-size:12px;">Paiements</th>
          <th style="padding:6px 8px;text-align:right;font-size:12px;">Encaissé</th>
        </tr>
      </thead>
      <tbody>${clientesHtml || '<tr><td colspan="4" style="padding:10px;text-align:center;color:#aaa;">Aucun encaissement ce mois</td></tr>'}</tbody>
    </table>
  `

  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, { scale: 1.5, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const ratio = pageW / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, canvas.height * ratio)
    await shareOrSavePdf(pdf, `rapport-mensuel-${mois || 'export'}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}
