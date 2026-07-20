import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { T, page } from './pdfTheme'
import { getCoordonnees } from './partageMesures'
import { appliquerFiligrane, appliquerPiedDePage } from './pdfBranding'

/**
 * Rendu commun des documents PDF (V2, 20/07).
 *
 * Les 7 exports répétaient chacun la même mécanique : créer un nœud hors-écran,
 * html2canvas, jsPDF, addImage, save. Six copies légèrement différentes — dont
 * certaines oubliaient la pagination et sortaient un document tronqué dès que le
 * contenu dépassait une page.
 *
 * Une seule implémentation ici : découpe multi-pages correcte, branding sur
 * chaque page, et le choix partage natif / téléchargement selon l'appareil.
 */

/**
 * @param {string} contenu  HTML composé avec les briques de pdfTheme
 * @param {string} nomFichier
 * @param {object} options  { partager: bool, titre: string }
 */
export async function rendrePdf(contenu, nomFichier, { partager = false, titre = 'Document' } = {}) {
  const pdf = await composerPdf(contenu)

  if (partager) return partagerOuTelecharger(pdf, nomFichier, { title: titre })

  pdf.save(nomFichier)
  return true
}

/**
 * Compose le document et rend l'instance jsPDF SANS la livrer.
 * Nécessaire pour les factures : leurs appelants récupèrent `{ pdf, filename }`
 * et décident eux-mêmes du partage ou du téléchargement.
 */
export async function composerPdf(contenu) {
  const noeud = page(contenu)

  try {
    const canvas = await html2canvas(noeud, { scale: 2, useCORS: true, backgroundColor: '#FFFFFF' })
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })

    const largeurPage = pdf.internal.pageSize.getWidth()
    const hauteurPage = pdf.internal.pageSize.getHeight()
    const ratio = largeurPage / canvas.width
    const hauteurTotale = canvas.height * ratio

    // Découpe multi-pages : sans elle, tout ce qui dépasse 842 pt était
    // simplement absent du PDF (documents longs tronqués en silence).
    const image = canvas.toDataURL('image/jpeg', 0.92)
    let reste = hauteurTotale
    let decalage = 0

    while (reste > 0) {
      if (decalage > 0) pdf.addPage()
      pdf.addImage(image, 'JPEG', 0, -decalage, largeurPage, hauteurTotale)
      reste -= hauteurPage
      decalage += hauteurPage
    }

    const coordonnees = await getCoordonnees()
    const total = pdf.getNumberOfPages()
    for (let p = 1; p <= total; p++) {
      pdf.setPage(p)
      appliquerFiligrane(pdf, coordonnees)
      appliquerPiedDePage(pdf, coordonnees, p, total)
    }

    return pdf
  } finally {
    noeud.remove()
  }
}

/**
 * Partage natif quand l'appareil le permet (mobile : WhatsApp, mail…), sinon
 * téléchargement. Le repli est indispensable : sur ordinateur, `navigator.share`
 * n'existe pas ou refuse les fichiers.
 */
export async function partagerOuTelecharger(pdf, nomFichier, { title = 'Document', text = '' } = {}) {
  const blob = pdf.output('blob')
  const fichier = new File([blob], nomFichier, { type: 'application/pdf' })

  if (navigator.canShare?.({ files: [fichier] })) {
    try {
      await navigator.share({ files: [fichier], title, text })
      return true
    } catch (e) {
      // Annulation volontaire de l'utilisateur : ne pas enchaîner sur un
      // téléchargement qu'il n'a pas demandé.
      if (e?.name === 'AbortError') return false
    }
  }

  pdf.save(nomFichier)
  return true
}

/** Nom de fichier sûr et lisible. */
export function nomFichier(...parties) {
  const base = parties.filter(Boolean).join('-')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/-+/g, '-').replace(/^-|-$/g, '')
    .toLowerCase()

  return `${base || 'document'}.pdf`
}

export { T }
