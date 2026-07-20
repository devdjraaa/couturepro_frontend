/**
 * Branding des documents PDF sortants (pts 4-5, lot direction du 20/07).
 *
 * Deux fonctions réutilisables par TOUS les exports (mesures aujourd'hui,
 * factures et relevés ensuite) : un filigrane répété en diagonale et un pied de
 * page. Volontairement séparées de l'export lui-même pour qu'un nouveau document
 * hérite du branding sans le réécrire.
 *
 * Les coordonnées viennent du serveur (`getCoordonnees`) : rien n'est figé ici.
 */

/**
 * Filigrane RÉPÉTÉ en diagonale sur toute la page (pas un seul motif centré,
 * comme demandé). Semi-transparent pour ne jamais gêner la lecture.
 */
export function appliquerFiligrane(pdf, coordonnees) {
  const largeur = pdf.internal.pageSize.getWidth()
  const hauteur = pdf.internal.pageSize.getHeight()
  const texte = `${coordonnees.marque} · ${coordonnees.site}`

  // L'état graphique est restauré à la fin : sans quoi l'opacité et la couleur
  // du filigrane contamineraient tout ce qui serait dessiné ensuite.
  pdf.saveGraphicsState()
  pdf.setGState(new pdf.GState({ opacity: 0.07 }))
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(16)

  const pasX = 260
  const pasY = 130
  for (let y = -pasY; y < hauteur + pasY; y += pasY) {
    for (let x = -pasX; x < largeur + pasX; x += pasX) {
      pdf.text(texte, x, y, { angle: 35 })
    }
  }

  pdf.restoreGraphicsState()
}

/** Pied de page : marque, site et téléphone, sur chaque page. */
export function appliquerPiedDePage(pdf, coordonnees, page, total) {
  const largeur = pdf.internal.pageSize.getWidth()
  const hauteur = pdf.internal.pageSize.getHeight()
  const y = hauteur - 22

  pdf.saveGraphicsState()
  pdf.setDrawColor(210)
  pdf.setLineWidth(0.5)
  pdf.line(40, y - 12, largeur - 40, y - 12)

  pdf.setFontSize(8)
  pdf.setTextColor(110)
  pdf.text(`${coordonnees.marque} · ${coordonnees.site} · ${coordonnees.telephone}`, 40, y)

  if (total > 1) {
    pdf.text(`${page}/${total}`, largeur - 40, y, { align: 'right' })
  }

  pdf.restoreGraphicsState()
}
