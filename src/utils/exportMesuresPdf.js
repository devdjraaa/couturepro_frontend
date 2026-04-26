import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function exportMesuresPdf(clientNom, mesures, atelierNom = 'Couture Pro') {
  if (!mesures || Object.keys(mesures).length === 0) return

  const toLabel = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  const entries = Object.entries(mesures).filter(([k, v]) => k !== 'notes' && v != null)
  const notes   = mesures.notes ?? null

  // Créer un nœud DOM temporaire hors-écran
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
      <h1 style="font-size: 20px; font-weight: bold; margin: 0;">Fiche de mesures</h1>
      <p style="font-size: 13px; color: #555; margin: 4px 0 0;">${clientNom}</p>
      <p style="font-size: 11px; color: #888; margin: 4px 0 0;">${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px;">
      ${entries.map(([key, value]) => `
        <div style="display: flex; justify-content: space-between; align-items: center;
                    border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
          <span style="font-size: 12px; color: #6b7280;">${toLabel(key)}</span>
          <span style="font-size: 13px; font-weight: 600; font-family: monospace;">${value} cm</span>
        </div>
      `).join('')}
    </div>

    ${notes ? `
    <div style="margin-top: 20px; background: #f9fafb; border-radius: 8px; padding: 12px;">
      <p style="font-size: 11px; color: #888; margin: 0 0 4px; font-weight: 600;">NOTES</p>
      <p style="font-size: 12px; color: #444; margin: 0; font-style: italic;">${notes}</p>
    </div>` : ''}

    <p style="margin-top: 24px; font-size: 10px; color: #bbb; text-align: center;">
      Généré par Couture Pro
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
    pdf.save(`mesures-${clientNom.replace(/\s+/g, '-').toLowerCase()}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}
