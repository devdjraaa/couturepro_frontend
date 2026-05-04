import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { shareOrSavePdf } from './shareNative'

const fmt = (v) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(Number(v) || 0) + ' FCFA'

const modeLabel = (m) =>
  ({ especes: 'Espèces', mobile_money: 'Mobile Money', virement: 'Virement' })[m] ?? m

export async function exportRapportCaissePdf({ stats, clients, atelierNom = 'Couture Pro' }) {
  const mois = stats.mois ?? ''
  const [annee, num] = mois.split('-')
  const moisLabel = num
    ? new Date(Number(annee), Number(num) - 1, 1)
        .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : mois

  const modesHtml = Object.entries(stats.modes_paiement ?? {})
    .map(([mode, total]) =>
      `<tr>
        <td style="padding:4px 0;color:#555;">${modeLabel(mode)}</td>
        <td style="padding:4px 0;text-align:right;font-weight:600;">${fmt(total)}</td>
      </tr>`
    ).join('')

  const clientsHtml = clients
    .filter(c => c.solde_restant > 0)
    .slice(0, 20)
    .map((c, i) =>
      `<tr style="background:${i % 2 === 0 ? '#f9f9f9' : '#fff'}">
        <td style="padding:5px 8px;">${c.prenom} ${c.nom}</td>
        <td style="padding:5px 8px;text-align:right;">${fmt(c.total_commande)}</td>
        <td style="padding:5px 8px;text-align:right;">${fmt(c.total_paye)}</td>
        <td style="padding:5px 8px;text-align:right;color:#dc2626;font-weight:600;">${fmt(c.solde_restant)}</td>
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
      <p style="font-size: 11px; color: #7c3aed; font-weight: 600; margin: 0 0 4px;">${atelierNom}</p>
      <h1 style="font-size: 22px; font-weight: bold; margin: 0;">Rapport Caisse</h1>
      <p style="font-size: 13px; color: #555; margin: 4px 0 0; text-transform: capitalize;">${moisLabel}</p>
      <p style="font-size: 11px; color: #aaa; margin: 4px 0 0;">Généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:28px;">
      <div style="background:#f0fdf4;border-radius:10px;padding:14px;">
        <p style="font-size:11px;color:#16a34a;font-weight:600;margin:0 0 4px;">Total encaissé</p>
        <p style="font-size:18px;font-weight:bold;color:#15803d;margin:0;">${fmt(stats.total_encaisse)}</p>
      </div>
      <div style="background:#fefce8;border-radius:10px;padding:14px;">
        <p style="font-size:11px;color:#ca8a04;font-weight:600;margin:0 0 4px;">En attente</p>
        <p style="font-size:18px;font-weight:bold;color:#a16207;margin:0;">${fmt(stats.total_en_attente)}</p>
      </div>
      <div style="background:#f5f3ff;border-radius:10px;padding:14px;">
        <p style="font-size:11px;color:#7c3aed;font-weight:600;margin:0 0 4px;">Soldées / En cours</p>
        <p style="font-size:18px;font-weight:bold;color:#6d28d9;margin:0;">${stats.nb_commandes_soldees} / ${stats.nb_commandes_en_cours}</p>
      </div>
    </div>

    ${modesHtml ? `
    <h2 style="font-size:14px;font-weight:600;margin:0 0 10px;">Encaissements par mode</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      ${modesHtml}
    </table>` : ''}

    <h2 style="font-size:14px;font-weight:600;margin:0 0 10px;">Soldes clients (${clients.filter(c => c.solde_restant > 0).length} débiteurs)</h2>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#6d28d9;color:#fff;">
          <th style="padding:6px 8px;text-align:left;font-size:12px;">Client</th>
          <th style="padding:6px 8px;text-align:right;font-size:12px;">Total</th>
          <th style="padding:6px 8px;text-align:right;font-size:12px;">Versé</th>
          <th style="padding:6px 8px;text-align:right;font-size:12px;">Reste dû</th>
        </tr>
      </thead>
      <tbody>${clientsHtml || '<tr><td colspan="4" style="padding:10px;text-align:center;color:#aaa;">Aucun solde en attente</td></tr>'}</tbody>
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
    await shareOrSavePdf(pdf, `rapport-caisse-${mois || 'export'}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}
