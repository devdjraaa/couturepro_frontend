// Variante WEB de src/utils/shareNative.js — la branche android porte la version
// native (Capacitor Share/Filesystem). Même chemin, même API : les fichiers partagés
// entre branches peuvent importer '@/utils/shareNative' sans diverger.

/**
 * Télécharge un fichier texte (CSV…) dans le navigateur.
 * @param {string} contenu   texte du fichier
 * @param {string} filename  ex: "mesures-aminata.csv"
 * @param {string} mime      ex: "text/csv"
 */
export async function shareOrSaveText(contenu, filename, mime = 'text/csv') {
  const blob = new Blob(['﻿' + contenu], { type: `${mime};charset=utf-8` }) // BOM → accents OK dans Excel
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a); a.click(); a.remove()
  URL.revokeObjectURL(url)
}

/**
 * Télécharge un PDF jsPDF déjà construit.
 * @param {import('jspdf').jsPDF} pdf
 * @param {string} filename
 */
export async function shareOrSavePdf(pdf, filename) {
  pdf.save(filename)
}
