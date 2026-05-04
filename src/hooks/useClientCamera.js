import { Capacitor } from '@capacitor/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

/**
 * Retourne une fonction qui ouvre la caméra/galerie selon le mode.
 * @returns {(source: 'camera'|'gallery') => Promise<string|null>} base64 JPEG ou null
 */
export function useClientCamera() {
  const isNative = Capacitor.isNativePlatform()

  const pickPhoto = async (source = 'gallery') => {
    if (isNative) {
      try {
        const photo = await Camera.getPhoto({
          quality:      85,
          allowEditing: false,
          resultType:   CameraResultType.Base64,
          source:       source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
        })
        return `data:image/jpeg;base64,${photo.base64String}`
      } catch {
        return null // utilisateur a annulé
      }
    }

    // Fallback web : <input type="file">
    return new Promise(resolve => {
      const input = document.createElement('input')
      input.type   = 'file'
      input.accept = 'image/*'
      input.onchange = async e => {
        const file = e.target.files?.[0]
        if (!file) { resolve(null); return }

        // Compression canvas → base64 (max ~200 Ko)
        const img = new Image()
        img.src = URL.createObjectURL(file)
        img.onload = () => {
          const MAX = 800
          const ratio = Math.min(1, MAX / Math.max(img.width, img.height))
          const canvas = document.createElement('canvas')
          canvas.width  = img.width  * ratio
          canvas.height = img.height * ratio
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/jpeg', 0.8))
        }
      }
      input.click()
    })
  }

  return { pickPhoto, isNative }
}
