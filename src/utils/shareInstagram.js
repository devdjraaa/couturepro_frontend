/**
 * Partage vers Instagram via Web Share API (mobile) ou fallback URL.
 * Sur mobile (Capacitor/PWA), le share sheet natif permet de poster sur IG Stories/Feed.
 * Sur desktop, on ouvre la page Instagram du profil (pas de partage direct possible).
 */
export async function shareToInstagram({ imageUrl, text, instagramHandle }) {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const file = new File([blob], 'creation.jpg', { type: blob.type || 'image/jpeg' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text })
        return 'shared'
      }
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled'
    }
  }

  if (instagramHandle) {
    const handle = instagramHandle.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
    window.open(`https://instagram.com/${handle}`, '_blank', 'noopener,noreferrer')
    return 'opened_profile'
  }

  return 'unsupported'
}
