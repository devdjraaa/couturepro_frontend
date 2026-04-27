const key = (id) => `cp_photo_${id}`

export function getClientPhoto(clientId) {
  if (!clientId) return null
  return localStorage.getItem(key(clientId))
}

export function saveClientPhoto(clientId, base64) {
  localStorage.setItem(key(clientId), base64)
}

export function deleteClientPhoto(clientId) {
  localStorage.removeItem(key(clientId))
}

export async function compressToBase64(file, maxKB = 200) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxDim = 800
        let { width: w, height: h } = img
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim }
          else       { w = Math.round((w * maxDim) / h); h = maxDim }
        }
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        let quality = 0.85
        let result = canvas.toDataURL('image/jpeg', quality)
        while (result.length > maxKB * 1024 * 1.4 && quality > 0.3) {
          quality -= 0.1
          result = canvas.toDataURL('image/jpeg', quality)
        }
        resolve(result)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}
