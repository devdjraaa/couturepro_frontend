import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { shareOrSavePdf } from './shareNative'

/**
 * Exporte une fiche technique (Outils Créatifs) en PDF A4 :
 * en-tête atelier + champs structurés (tissu, fournitures, coût matière,
 * temps, taille de base) + instructions + première image éventuelle.
 *
 * @param {object} item        création designer { titre, description, metadata, images }
 * @param {object} labels      libellés i18n { tissu, fournitures, cout_matiere, temps_confection, taille_base, instructions, titre_doc }
 * @param {string} atelierNom
 * @param {string|null} imgUrl URL absolue de la première image (optionnelle)
 */
export async function exportFicheTechniquePdf(item, labels, atelierNom = 'Gextimo', imgUrl = null) {
  const meta = item.metadata ?? {}

  const champs = ['tissu', 'fournitures', 'cout_matiere', 'temps_confection', 'taille_base']
    .filter(k => meta[k])
    .map(k => ({ label: labels[k] ?? k, value: meta[k] }))

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
      <h1 style="font-size: 20px; font-weight: bold; margin: 0;">${labels.titre_doc}</h1>
      <p style="font-size: 13px; color: #555; margin: 4px 0 0;">${item.titre}</p>
      <p style="font-size: 11px; color: #888; margin: 4px 0 0;">${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    </div>

    ${imgUrl ? `<img src="${imgUrl}" crossorigin="anonymous" style="width: 100%; max-height: 260px; object-fit: cover; border-radius: 8px; margin-bottom: 16px;" />` : ''}

    ${item.description ? `<p style="font-size: 12px; color: #444; margin: 0 0 16px;">${item.description}</p>` : ''}

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px;">
      ${champs.map(({ label, value }) => `
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;
                    border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
          <span style="font-size: 12px; color: #6b7280;">${label}</span>
          <span style="font-size: 13px; font-weight: 600; text-align: right;">${value}</span>
        </div>
      `).join('')}
    </div>

    ${meta.instructions ? `
    <div style="margin-top: 20px; background: #f9fafb; border-radius: 8px; padding: 12px;">
      <p style="font-size: 11px; color: #888; margin: 0 0 4px; font-weight: 600;">${(labels.instructions ?? '').toUpperCase()}</p>
      <p style="font-size: 12px; color: #444; margin: 0; white-space: pre-wrap;">${meta.instructions}</p>
    </div>` : ''}

    <p style="margin-top: 24px; font-size: 10px; color: #bbb; text-align: center;">
      Généré par Gextimo
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
    const slug = (item.titre ?? 'fiche').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    await shareOrSavePdf(pdf, `fiche-technique-${slug || 'fiche'}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}
