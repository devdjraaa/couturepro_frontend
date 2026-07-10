/**
 * Redimensionne + compresse une image côté client avant upload.
 * Les photos d'un téléphone font souvent 3–8 Mo ; le serveur les refuse au-delà
 * de 5 Mo. On les ramène à ~1600px max en JPEG (qualité 0.82) → typiquement < 1 Mo,
 * upload rapide et fiable, largement suffisant pour une vitrine.
 *
 * En cas d'échec (format exotique, canvas indisponible), on renvoie le fichier
 * d'origine — l'upload tentera quand même.
 */
export async function compressImage(file, maxDim = 1600, quality = 0.82) {
  if (!file || !file.type?.startsWith('image/')) return file

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (Math.max(width, height) > maxDim) {
        const scale = maxDim / Math.max(width, height)
        width  = Math.round(width * scale)
        height = Math.round(height * scale)
      }
      try {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file)
            const name = (file.name || 'photo').replace(/\.\w+$/, '') + '.jpg'
            resolve(new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() }))
          },
          'image/jpeg',
          quality,
        )
      } catch {
        resolve(file)
      }
    }

    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}
