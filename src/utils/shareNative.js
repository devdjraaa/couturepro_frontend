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
