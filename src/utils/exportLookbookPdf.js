import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { shareOrSavePdf } from './shareNative'

const fmt = (v) =>
  v ? new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(Number(v)) + ' FCFA' : ''

/**
 * PL-1 : Lookbook PDF — catalogue visuel des créations (une grille de vignettes
 * titre + prix). Sert de book partageable pour une collection ou toute la vitrine.
 *
 * @param {object}   opts
 * @param {string}   opts.atelierNom
 * @param {string}   opts.titre        titre du lookbook (nom de collection ou "Lookbook")
 * @param {Array}    opts.creations    [{ nom|titre, prix, image_url }]
 */
export async function exportLookbookPdf({ atelierNom = 'Gextimo', titre = 'Lookbook', creations = [] }) {
  const cards = creations.map(c => {
    const nom = c.nom ?? c.titre ?? ''
    const img = c.image_url
      ? `<div style="width:100%;height:190px;background:#f3f4f6;border-radius:8px;overflow:hidden;">
           <img src="${c.image_url}" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover;" /></div>`
      : `<div style="width:100%;height:190px;background:#f3f4f6;border-radius:8px;"></div>`
    return `
      <div style="width:31%;margin-bottom:18px;">
        ${img}
        <p style="font-size:12px;font-weight:600;color:#111;margin:6px 0 2px;">${nom}</p>
        <p style="font-size:12px;color:#6d28d9;font-weight:600;margin:0;">${fmt(c.prix)}</p>
      </div>`
  }).join('')

  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: 720px; padding: 40px;
    font-family: sans-serif; background: #ffffff; color: #111;
  `
  container.innerHTML = `
    <div style="border-bottom: 2px solid #6d28d9; padding-bottom: 14px; margin-bottom: 24px;">
      <p style="font-size: 11px; color: #7c3aed; font-weight: 600; margin: 0 0 4px; letter-spacing:1px; text-transform:uppercase;">${atelierNom}</p>
      <h1 style="font-size: 26px; font-weight: bold; margin: 0;">${titre}</h1>
      <p style="font-size: 11px; color: #aaa; margin: 6px 0 0;">${creations.length} création${creations.length > 1 ? 's' : ''} · ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
    </div>
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;">${cards}</div>
    <p style="margin-top: 20px; font-size: 10px; color: #bbb; text-align: center;">Généré par Gextimo</p>
  `
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, { scale: 1.5, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const ratio = pageW / canvas.width
    const imgH = canvas.height * ratio

    // Pagination : on découpe l'image haute sur plusieurs pages A4.
    let restant = imgH
    let position = 0
    pdf.addImage(imgData, 'PNG', 0, position, pageW, imgH)
    restant -= pageH
    while (restant > 0) {
      position -= pageH
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, pageW, imgH)
      restant -= pageH
    }

    const slug = (titre || 'lookbook').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    await shareOrSavePdf(pdf, `lookbook-${slug || 'collection'}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}
