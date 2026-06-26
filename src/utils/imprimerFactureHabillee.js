// Façon A — « habillage » GEXTIMO d'une facture normalisée e-SFE.
// On NE reconstruit RIEN : on EMBARQUE le PDF officiel (déjà certifié par la DGI)
// INTACT dans un nouveau PDF, avec un en-tête GEXTIMO au-dessus et un pied de
// vérification en dessous. On produit un VRAI PDF (pas une iframe imprimée, qui
// n'embarque pas le document) → impression/partage fiables, y compris en WebView.
// GEXTIMO habille, il ne certifie pas : les éléments de sécurité restent ceux du
// PDF e-SFE reproduit tel quel.
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

const A4 = [595.28, 841.89]
const ACCENT = rgb(0.816, 0.043, 0.043) // charte GEXTIMO (#D00B0B)
const GREY   = rgb(0.42, 0.45, 0.5)
const WHITE  = rgb(1, 1, 1)
const INK    = rgb(0.12, 0.16, 0.22)

// WinAnsi (police standard) n'encode pas certains caractères (—, …) → on nettoie.
const safe = (s) => String(s ?? '').replace(/[—–]/g, '-').replace(/…/g, '...')

// Compose le PDF habillé et renvoie ses octets (Uint8Array).
export async function genererFactureHabillee(doc, atelier) {
  const res = await fetch(doc.dgi_pdf_url)
  if (!res.ok) throw new Error('PDF officiel inaccessible')
  const srcBytes = await res.arrayBuffer()

  const out  = await PDFDocument.create()
  const bold = await out.embedFont(StandardFonts.HelveticaBold)
  const reg  = await out.embedFont(StandardFonts.Helvetica)
  const pages = await out.embedPdf(srcBytes)

  const nom = safe(atelier?.nom || 'Mon atelier')
  const sub = safe([atelier?.ville, atelier?.telephone || atelier?.contact_public].filter(Boolean).join(' · '))

  pages.forEach((ep) => {
    const page = out.addPage(A4)
    // En-tête GEXTIMO
    page.drawRectangle({ x: 0, y: A4[1] - 58, width: A4[0], height: 58, color: ACCENT })
    page.drawText(nom, { x: 24, y: A4[1] - 32, font: bold, size: 15, color: WHITE })
    if (sub) page.drawText(sub, { x: 24, y: A4[1] - 47, font: reg, size: 9, color: WHITE })
    page.drawText('GEXTIMO · By Novafriq', { x: A4[0] - 168, y: A4[1] - 32, font: bold, size: 11, color: WHITE })

    // PDF officiel e-SFE embarqué INTACT, mis à l'échelle entre en-tête et pied
    const maxW = A4[0] - 48, maxH = A4[1] - 58 - 80
    const s = Math.min(maxW / ep.width, maxH / ep.height)
    page.drawPage(ep, { x: (A4[0] - ep.width * s) / 2, y: 72, width: ep.width * s, height: ep.height * s })

    // Pied de vérification (complète le QR officiel, ne le remplace pas)
    page.drawLine({ start: { x: 24, y: 62 }, end: { x: A4[0] - 24, y: 62 }, thickness: 1.5, color: ACCENT })
    page.drawText('Facture normalisee certifiee e-MECeF - DGI Benin', { x: 24, y: 47, font: bold, size: 9, color: INK })
    page.drawText('Verification : sygmef.impots.bj/verification  (saisir le CODE MECeF/DGI et le NIM ci-dessus)', { x: 24, y: 35, font: reg, size: 8, color: GREY })
    page.drawText('Mise en page GEXTIMO. Les elements de securite sont ceux de la facture e-MECeF reproduite ci-dessus.', { x: 24, y: 24, font: reg, size: 7, color: GREY })
  })

  return out.save()
}

// Génère puis partage (mobile) ou télécharge (web) le PDF habillé.
export async function partagerFactureHabillee(doc, atelier) {
  const bytes = await genererFactureHabillee(doc, atelier)
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const filename = `facture-${(doc?.numero || 'gextimo')}.pdf`
  const file = new File([blob], filename, { type: 'application/pdf' })

  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return 'shared' }
    catch (e) { if (e?.name === 'AbortError') return 'cancelled' }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
  return 'downloaded'
}
