// PWA (P186) — WEB UNIQUEMENT. Jamais dans l'app Capacitor : un service worker
// y interférerait avec les mises à jour OTA (Capgo).
import { IS_NATIVE } from '@/constants/routes'

let deferredPrompt = null
const listeners = new Set()

export function registerPwa() {
  if (IS_NATIVE || typeof window === 'undefined') return
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return

  navigator.serviceWorker.register('/sw.js').catch(() => { /* non bloquant */ })

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    listeners.forEach(fn => fn(true))
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    listeners.forEach(fn => fn(false))
  })
}

// La bannière s'abonne : callback(true) quand l'installation devient proposable.
export function onInstallable(fn) {
  listeners.add(fn)
  if (deferredPrompt) fn(true)
  return () => listeners.delete(fn)
}

export async function promptInstall() {
  if (!deferredPrompt) return false
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  listeners.forEach(fn => fn(false))
  return outcome === 'accepted'
}
