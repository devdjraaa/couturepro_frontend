import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const formatCFA = (v) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(Number(v) || 0) + ' FCFA'

const formatDate = (d) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

const modeLabel = (mode) =>
  ({ mobile_money: 'Mobile Money', virement: 'Virement', especes: 'Espèces' })[mode] ?? mode

export async function exportRelevePdf({ commande, paiements, clientNom, atelierNom = 'Couture Pro' }) {
  const reste = Math.max(0, Number(commande.prix ?? 0) - Number(commande.acompte ?? 0))
  const ref = String(commande.id).slice(0, 8).toUpperCase()

  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: 595px; padding: 40px;
    font-family: sans-serif;
    background: #ffffff; color: #111;
  `

  container.innerHTML = `
    <div style="border-bottom: 2px solid #6d28d9; padding-bottom: 12px; margin-bottom: 20px;">
      <p style="font-size: 11px; color: #7c3aed; font-weight: 600; margin: 0 0 4px;">${atelierNom}</p>
      <h1 style="font-size: 20px; font-weight: bold; margin: 0;">Relevé de paiements</h1>
      <p style="font-size: 13px; color: #555; margin: 4px 0 0;">${clientNom} · Commande #${ref}</p>
      <p style="font-size: 11px; color: #888; margin: 4px 0 0;">${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    </div>

    <div style="margin-bottom: 20px; display: flex; gap: 24px;">
      <div style="flex: 1; background: #f3f4f6; border-radius: 8px; padding: 12px;">
        <p style="font-size: 11px; color: #6b7280; margin: 0 0 2px;">Montant total</p>
        <p style="font-size: 16px; font-weight: bold; margin: 0;">${formatCFA(commande.prix)}</p>
      </div>
      <div style="flex: 1; background: #ecfdf5; border-radius: 8px; padding: 12px;">
        <p style="font-size: 11px; color: #059669; margin: 0 0 2px;">Versé</p>
        <p style="font-size: 16px; font-weight: bold; color: #059669; margin: 0;">${formatCFA(commande.acompte)}</p>
      </div>
      <div style="flex: 1; background: ${reste > 0 ? '#fff7ed' : '#ecfdf5'}; border-radius: 8px; padding: 12px;">
        <p style="font-size: 11px; color: ${reste > 0 ? '#ea580c' : '#059669'}; margin: 0 0 2px;">Reste</p>
        <p style="font-size: 16px; font-weight: bold; color: ${reste > 0 ? '#ea580c' : '#059669'}; margin: 0;">${formatCFA(reste)}</p>
      </div>
    </div>

    <p style="font-size: 12px; font-weight: 600; color: #374151; margin: 0 0 8px;">Historique des versements</p>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
      <thead>
        <tr style="background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
          <th style="text-align: left; padding: 8px 10px; color: #6b7280; font-weight: 600;">Date</th>
          <th style="text-align: left; padding: 8px 10px; color: #6b7280; font-weight: 600;">Mode</th>
          <th style="text-align: right; padding: 8px 10px; color: #6b7280; font-weight: 600;">Montant</th>
        </tr>
      </thead>
      <tbody>
        ${paiements.map(p => `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 10px; color: #374151;">${formatDate(p.created_at)}</td>
            <td style="padding: 8px 10px; color: #374151;">${modeLabel(p.mode_paiement)}</td>
            <td style="padding: 8px 10px; text-align: right; font-weight: 600; font-family: monospace;">${formatCFA(p.montant)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <p style="margin-top: 32px; font-size: 10px; color: #bbb; text-align: center;">
      Document non officiel — Relevé interne généré par Couture Pro
    </p>
  `

  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const ratio = pageW / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, canvas.height * ratio)
    pdf.save(`releve-${clientNom.replace(/\s+/g, '-').toLowerCase()}-${ref}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}
