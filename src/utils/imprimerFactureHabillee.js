// Façon A — « habillage » GEXTIMO d'une facture normalisée e-SFE.
// On NE reconstruit RIEN : on EMBARQUE le PDF officiel (déjà certifié par la DGI)
// INTACT dans un nouveau PDF, avec un en-tête GEXTIMO au-dessus et un pied de
// vérification en dessous. On produit un VRAI PDF (pas une iframe imprimée, qui
// n'embarque pas le document) → impression/partage fiables, y compris en WebView.
// GEXTIMO habille, il ne certifie pas : les éléments de sécurité restent ceux du
// PDF e-SFE reproduit tel quel.
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import api from '@/services/api'
import { IS_NATIVE } from '@/constants/routes'
import logoUrl from '@/assets/gextimo-logo.png'

// Base64 depuis un Uint8Array (par blocs pour ne pas exploser la pile sur un gros PDF).
function bytesToBase64(bytes) {
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
  }
  return btoa(bin)
}

const A4 = [595.28, 841.89]
const ACCENT = rgb(0.816, 0.043, 0.043) // charte GEXTIMO (#D00B0B)
const GREY   = rgb(0.42, 0.45, 0.5)
const WHITE  = rgb(1, 1, 1)
const INK    = rgb(0.12, 0.16, 0.22)

// WinAnsi (police standard) n'encode pas certains caractères (—, …) → on nettoie.
const safe = (s) => String(s ?? '').replace(/[—–]/g, '-').replace(/…/g, '...')

// Récupère les octets du PDF officiel : via l'API (même origine, CORS api/* ok),
// avec repli sur l'URL directe du stockage si besoin.
async function chargerPdfOfficiel(doc) {
  if (doc?.id) {
    try {
      const { data } = await api.get(`/factures/${doc.id}/dgi`, { responseType: 'arraybuffer' })
      return data
    } catch { /* repli ci-dessous */ }
  }
  const res = await fetch(doc.dgi_pdf_url)
  if (!res.ok) throw new Error('PDF officiel inaccessible')
  return res.arrayBuffer()
}

// Compose le PDF habillé et renvoie ses octets (Uint8Array).
export async function genererFactureHabillee(doc, atelier) {
  const srcBytes = await chargerPdfOfficiel(doc)

  const out  = await PDFDocument.create()
  const bold = await out.embedFont(StandardFonts.HelveticaBold)
  const reg  = await out.embedFont(StandardFonts.Helvetica)
  const pages = await out.embedPdf(srcBytes)

  // Logo GEXTIMO officiel (embarqué une fois, réutilisé sur chaque page).
  let logoImg = null
  try {
    const logoBytes = await (await fetch(logoUrl)).arrayBuffer()
    logoImg = await out.embedPng(logoBytes)
  } catch { /* pas de logo : en-tête sans image */ }

  const nom = safe(atelier?.nom || 'Mon atelier')
  const sub = safe([atelier?.ville, atelier?.telephone || atelier?.contact_public].filter(Boolean).join(' · '))
  const top = A4[1]

  pages.forEach((ep) => {
    const page = out.addPage(A4)

    // En-tête clair : logo + « GEXTIMO » à gauche · nom de l'atelier à l'extrême droite · trait rouge
    const logoSize = 32
    if (logoImg) page.drawImage(logoImg, { x: 24, y: top - 22 - logoSize, width: logoSize, height: logoSize })
    const brandX = 24 + (logoImg ? logoSize + 12 : 0)
    page.drawText('GEXTIMO', { x: brandX, y: top - 38, font: bold, size: 20, color: ACCENT })
    page.drawText('By Novafriq', { x: brandX + 2, y: top - 51, font: reg, size: 8, color: GREY })
    // Atelier aligné à droite, sur la même ligne que GEXTIMO
    const nomW = bold.widthOfTextAtSize(nom, 14)
    page.drawText(nom, { x: A4[0] - 24 - nomW, y: top - 36, font: bold, size: 14, color: INK })
    if (sub) {
      const subW = reg.widthOfTextAtSize(sub, 9)
      page.drawText(sub, { x: A4[0] - 24 - subW, y: top - 50, font: reg, size: 9, color: GREY })
    }
    page.drawLine({ start: { x: 24, y: top - 64 }, end: { x: A4[0] - 24, y: top - 64 }, thickness: 1.5, color: ACCENT })

    // PDF officiel e-SFE embarqué INTACT, mis à l'échelle entre l'en-tête et le pied
    const topContent = top - 80
    const maxW = A4[0] - 48, maxH = topContent - 82
    const s = Math.min(maxW / ep.width, maxH / ep.height)
    const w = ep.width * s, h = ep.height * s
    page.drawPage(ep, { x: (A4[0] - w) / 2, y: topContent - h, width: w, height: h })

    // Pied de vérification (complète le QR officiel, ne le remplace pas)
    page.drawLine({ start: { x: 24, y: 62 }, end: { x: A4[0] - 24, y: 62 }, thickness: 1.5, color: ACCENT })
    page.drawText('Facture normalisee certifiee e-MECeF - DGI Benin', { x: 24, y: 47, font: bold, size: 9, color: INK })
    page.drawText('Verification : sygmef.impots.bj/verification  (saisir le CODE MECeF/DGI et le NIM ci-dessus)', { x: 24, y: 35, font: reg, size: 8, color: GREY })
    page.drawText('Mise en page GEXTIMO. Les elements de securite sont ceux de la facture e-MECeF reproduite ci-dessus.', { x: 24, y: 24, font: reg, size: 7, color: GREY })
  })

  return out.save()
}

// Génère puis partage (mobile) ou télécharge (web) le PDF habillé.
export async function partagerFactureHabillee(doc, atelier, { text = '' } = {}) {
  const bytes = await genererFactureHabillee(doc, atelier)
  const filename = `facture-${(doc?.numero || 'gextimo')}.pdf`

  // Chemin natif (Capacitor) : le WebView Android n'a ni navigator.share ni de
  // gestionnaire pour a.download → on écrit le fichier puis partage natif.
  if (IS_NATIVE) {
    try {
      const [{ Filesystem, Directory }, { Share }] = await Promise.all([
        import('@capacitor/filesystem'),
        import('@capacitor/share'),
      ])
      const { uri } = await Filesystem.writeFile({
        path: filename.replace(/[^\w.\-]+/g, '_'),
        data: bytesToBase64(bytes),
        directory: Directory.Cache,
      })
      await Share.share({ title: filename, text, files: [uri] })
      return 'shared'
    } catch (e) {
      if (e?.message && /cancel/i.test(e.message)) return 'cancelled'
      // repli navigateur ci-dessous
    }
  }

  const blob = new Blob([bytes], { type: 'application/pdf' })
  const file = new File([blob], filename, { type: 'application/pdf' })
  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename, text }); return 'shared' }
    catch (e) { if (e?.name === 'AbortError') return 'cancelled' }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
  return 'downloaded'
}
