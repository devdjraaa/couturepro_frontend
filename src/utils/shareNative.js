import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { Filesystem, Directory } from '@capacitor/filesystem'

/**
 * Sur Android (natif) : écrit le PDF dans le cache, ouvre le share natif (WhatsApp, Drive…).
 * Sur web : déclenche le téléchargement classique via pdf.save().
 *
 * @param {import('jspdf').jsPDF} pdf       instance jsPDF déjà construite
 * @param {string}               filename   nom du fichier (ex: "releve-aminata.pdf")
 */
export async function shareOrSavePdf(pdf, filename) {
  if (!Capacitor.isNativePlatform()) {
    pdf.save(filename)
    return
  }

  // Convertit en base64 (sans le préfixe data URI)
  const base64 = pdf.output('datauristring').split(',')[1]

  // Écrit dans le dossier cache de l'app
  await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Cache,
  })

  // Récupère l'URI native (content:// sur Android)
  const { uri } = await Filesystem.getUri({
    path: filename,
    directory: Directory.Cache,
  })

  await Share.share({
    title: filename,
    files: [uri],
    dialogTitle: 'Partager le PDF',
  })
}

/**
 * P12/P61 : partage/enregistre un contenu texte (ex. CSV des mesures).
 * Natif → écrit dans le cache + share (WhatsApp, Drive…) ; web → téléchargement blob.
 * @param {string} contenu   texte du fichier
 * @param {string} filename  ex: "mesures-aminata.csv"
 * @param {string} mime      ex: "text/csv"
 */
export async function shareOrSaveText(contenu, filename, mime = 'text/csv') {
  if (!Capacitor.isNativePlatform()) {
    const blob = new Blob(['﻿' + contenu], { type: `${mime};charset=utf-8` }) // BOM → accents OK dans Excel
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), { href: url, download: filename })
    document.body.appendChild(a); a.click(); a.remove()
    URL.revokeObjectURL(url)
    return
  }

  const base64 = btoa(unescape(encodeURIComponent('﻿' + contenu)))
  await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache })
  const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache })
  await Share.share({ title: filename, files: [uri], dialogTitle: 'Partager le fichier' })
}
