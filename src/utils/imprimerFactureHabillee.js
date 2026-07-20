// Habillage GEXTIMO d'une facture normalisée e-MECeF — V2 (refonte du 20/07).
//
// Ce document est le seul des huit à NE PAS être composé en HTML : il EMBARQUE
// le PDF officiel déjà certifié par la DGI, INTACT, dans une page GEXTIMO.
// Le rasteriser (comme les autres exports) détruirait son texte sélectionnable
// et ses éléments de sécurité — ce serait une falsification de fait.
//
// GEXTIMO habille, il ne certifie pas. La mention le dit explicitement en pied
// de page : c'est une obligation, pas une politesse.
//
// Les couleurs sont DÉRIVÉES de pdfTheme : ce document suit automatiquement
// toute bascule d'accent décidée pour les sept autres.
//
// Contrainte technique assumée : pdf-lib ne dispose que des polices standard du
// format PDF (Helvetica, Times, Courier). La charte utilise Bodoni Moda, qu'il
// faudrait embarquer via fontkit — plusieurs centaines de kilo-octets à charger
// pour chaque facture, sur des connexions béninoises souvent limitées. On emploie
// donc Times Roman pour le titrage : c'est un serif classique, dans l'esprit du
// Bodoni, et il ne coûte pas un octet de téléchargement.
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import api from '@/services/api'
import { T } from './pdfTheme'

const A4 = [595.28, 841.89]

/**
 * Couleurs DÉRIVÉES du thème commun : pdf-lib attend des composantes 0-1, pas
 * des codes hexadécimaux. Les recopier à la main créerait une seconde source de
 * vérité qui dériverait au premier changement de charte — ce document resterait
 * seul dans l'ancienne couleur sans que personne ne le remarque.
 */
const couleur = (hex) => {
  const n = parseInt(hex.slice(1), 16)

  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

const ACCENT       = couleur(T.accent)
const ACCENT_FONCE = couleur(T.accentSombre)
const ENCRE        = couleur(T.encre)
const GRIS         = couleur(T.gris)
const FILET        = couleur(T.filet)

const MARGE = 40
const HAUT_ENTETE = 74   // zone réservée à l'en-tête
const HAUT_PIED   = 74   // zone réservée au bloc de vérification

// WinAnsi (polices standard) n'encode pas certains caractères : on nettoie
// plutôt que de laisser pdf-lib lever une exception au milieu d'une facture.
const safe = (s) => String(s ?? '')
  .replace(/[—–]/g, '-')
  .replace(/…/g, '...')
  .replace(/[’‘]/g, "'")
  .replace(/[“”]/g, '"')

/**
 * Octets du PDF officiel. On passe par l'API (même origine) et on se replie sur
 * l'URL de stockage : selon le chemin d'accès, l'un des deux peut être bloqué
 * par CORS.
 */
async function chargerPdfOfficiel(doc) {
  if (doc?.id) {
    try {
      const { data } = await api.get(`/factures/${doc.id}/dgi`, { responseType: 'arraybuffer' })
      return data
    } catch { /* repli ci-dessous */ }
  }
  if (!doc?.dgi_pdf_url) throw new Error('Aucune facture normalisée rattachée à ce document.')

  const res = await fetch(doc.dgi_pdf_url)
  if (!res.ok) throw new Error('PDF officiel inaccessible')

  return res.arrayBuffer()
}

/** Texte en capitales espacées (pdf-lib n'offre pas d'option d'interlettrage). */
function dessinerEspace(page, texte, { x, y, font, size, color, espacement = 1 }) {
  let curseur = x
  for (const lettre of texte) {
    page.drawText(lettre, { x: curseur, y, font, size, color })
    curseur += font.widthOfTextAtSize(lettre, size) + espacement
  }
}

/** Compose le PDF habillé et renvoie ses octets. */
export async function genererFactureHabillee(doc, atelier) {
  const srcBytes = await chargerPdfOfficiel(doc)

  const out    = await PDFDocument.create()
  const serif  = await out.embedFont(StandardFonts.TimesRoman)
  const sans   = await out.embedFont(StandardFonts.Helvetica)
  const sansB  = await out.embedFont(StandardFonts.HelveticaBold)
  const pages  = await out.embedPdf(srcBytes)

  const nomAtelier = safe(atelier?.nom || 'Mon atelier')
  const mentions   = safe(
    [atelier?.ville, atelier?.telephone || atelier?.contact_public].filter(Boolean).join(' · ')
  )
  const total = pages.length

  pages.forEach((officiel, index) => {
    const page = out.addPage(A4)
    const [L, H] = A4

    /* ── En-tête : même langage que les 7 autres documents ─────────────────
       Nom de l'atelier en capitales espacées, titre en serif, filet or.
       Pas de bandeau rouge pleine largeur (V1) : sur une imprimante à jet
       d'encre, un aplat de 58 pt de haut se voit et coûte cher. */
    // `characterSpacing` n'existe pas dans cette version de pdf-lib : l'option
    // serait ignorée sans erreur. On espace donc lettre par lettre.
    dessinerEspace(page, nomAtelier.toUpperCase(), {
      x: MARGE, y: H - 34, font: sansB, size: 8, color: ACCENT_FONCE, espacement: 1.4,
    })
    page.drawText('Facture normalisee', {
      x: MARGE, y: H - 56, font: serif, size: 18, color: ENCRE,
    })

    // Numéro à droite, aligné sur la même ligne de base que le titre.
    if (doc?.numero) {
      const ref = safe(doc.numero)
      const largeur = sansB.widthOfTextAtSize(ref, 10)
      page.drawText(ref, { x: L - MARGE - largeur, y: H - 56, font: sansB, size: 10, color: ENCRE })
    }

    if (mentions) {
      const largeur = sans.widthOfTextAtSize(mentions, 8)
      page.drawText(mentions, { x: L - MARGE - largeur, y: H - 34, font: sans, size: 8, color: GRIS })
    }

    // Filet or : la signature visuelle commune aux documents Gextimo.
    page.drawRectangle({ x: MARGE, y: H - HAUT_ENTETE + 8, width: L - MARGE * 2, height: 1.5, color: ACCENT })

    /* ── Le document officiel, INTACT ──────────────────────────────────────
       Mis à l'échelle pour tenir entre l'en-tête et le pied, centré, sans
       jamais être agrandi au-delà de sa taille d'origine (un agrandissement
       rendrait un scan certifié flou et douteux à la lecture). */
    const dispoL = L - MARGE * 2
    const dispoH = H - HAUT_ENTETE - HAUT_PIED
    const k = Math.min(dispoL / officiel.width, dispoH / officiel.height, 1)
    const larg = officiel.width * k
    const haut = officiel.height * k

    page.drawPage(officiel, {
      x: (L - larg) / 2,
      y: HAUT_PIED + (dispoH - haut) / 2,
      width: larg,
      height: haut,
    })

    // Cadre discret : montre où s'arrête le document certifié et où commence
    // notre mise en page. La distinction doit rester lisible à l'œil nu.
    page.drawRectangle({
      x: (L - larg) / 2 - 6, y: HAUT_PIED + (dispoH - haut) / 2 - 6,
      width: larg + 12, height: haut + 12,
      borderColor: FILET, borderWidth: 0.75,
    })

    /* ── Pied de vérification ──────────────────────────────────────────────
       Complète le QR officiel, ne le remplace jamais. */
    page.drawRectangle({ x: MARGE, y: HAUT_PIED - 12, width: L - MARGE * 2, height: 1, color: FILET })

    page.drawText('Facture normalisee certifiee e-MECeF - DGI Benin', {
      x: MARGE, y: HAUT_PIED - 28, font: sansB, size: 8.5, color: ENCRE,
    })
    page.drawText('Verification : sygmef.impots.bj/verification (saisir le code MECeF/DGI et le NIM figurant ci-dessus)', {
      x: MARGE, y: HAUT_PIED - 41, font: sans, size: 7.5, color: GRIS,
    })
    page.drawText("Mise en page GEXTIMO. Les elements de securite sont ceux de la facture e-MECeF reproduite ci-dessus, sans modification.", {
      x: MARGE, y: HAUT_PIED - 53, font: sans, size: 6.8, color: GRIS,
    })

    // Signature de bas de page, identique aux 7 autres documents.
    page.drawText('Gextimo - www.gextimo.novafriq.africa', {
      x: MARGE, y: 20, font: sans, size: 7, color: GRIS,
    })
    if (total > 1) {
      const pagination = `${index + 1}/${total}`
      const largeur = sans.widthOfTextAtSize(pagination, 7)
      page.drawText(pagination, { x: L - MARGE - largeur, y: 20, font: sans, size: 7, color: GRIS })
    }
  })

  return out.save()
}

/** Génère puis partage (mobile) ou télécharge (ordinateur) le PDF habillé. */
export async function partagerFactureHabillee(doc, atelier) {
  const bytes = await genererFactureHabillee(doc, atelier)
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const filename = `facture-${safe(doc?.numero || 'gextimo').replace(/[^\w-]+/g, '-')}.pdf`
  const file = new File([blob], filename, { type: 'application/pdf' })

  if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename })
      return 'shared'
    } catch (e) {
      // Annulation volontaire : ne pas enchaîner sur un téléchargement non demandé.
      if (e?.name === 'AbortError') return 'cancelled'
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 4000)

  return 'downloaded'
}
