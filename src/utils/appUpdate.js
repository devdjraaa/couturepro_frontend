// Mises à jour de l'app :
//  - OTA (bundle web) : gérée par @capgo/capacitor-updater en auto-update.
//    notifyAppReady() confirme que le bundle démarre bien (sinon rollback Capgo).
//  - Version native (grosse MAJ) : on interroge le backend /app/version et on
//    compare à la version installée pour proposer / imposer le téléchargement APK.
import { IS_NATIVE } from '@/constants/routes'
import api from '@/services/api'

// Compare deux versions "x.y.z" numériquement. -1 si a<b, 0 si égal, 1 si a>b.
export function cmpVersion(a, b) {
  const pa = String(a ?? '').split('.').map((n) => parseInt(n, 10) || 0)
  const pb = String(b ?? '').split('.').map((n) => parseInt(n, 10) || 0)
  const len = Math.max(pa.length, pb.length)
  for (let i = 0; i < len; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0)
    if (d !== 0) return d < 0 ? -1 : 1
  }
  return 0
}

// Confirme à Capgo que le bundle web courant fonctionne (à appeler au démarrage).
export async function notifyAppReady() {
  if (!IS_NATIVE) return
  try {
    const { CapacitorUpdater } = await import('@capgo/capacitor-updater')
    await CapacitorUpdater.notifyAppReady()
  } catch { /* plugin absent (web) : rien à faire */ }
}

// Version native installée (ex. "1.0"), ou null hors natif.
export async function getNativeVersion() {
  if (!IS_NATIVE) return null
  try {
    const { App } = await import('@capacitor/app')
    const info = await App.getInfo()
    return info?.version || null
  } catch { return null }
}

// Vérifie s'il faut mettre à jour la version NATIVE (télécharger l'APK).
// Retourne { status: 'ok' | 'optional' | 'required', current, latest, apkUrl, note }.
export async function checkAppVersion() {
  if (!IS_NATIVE) return { status: 'ok' }
  try {
    const current = await getNativeVersion()
    const { data } = await api.get('/app/version')
    const min = data?.min_version
    const latest = data?.latest_version
    const base = { current, latest, apkUrl: data?.apk_url, note: data?.note }
    if (current && min && cmpVersion(current, min) < 0) return { ...base, status: 'required' }
    if (current && latest && cmpVersion(current, latest) < 0) return { ...base, status: 'optional' }
    return { ...base, status: 'ok' }
  } catch {
    return { status: 'ok' } // erreur réseau : ne jamais bloquer l'utilisateur
  }
}

// Ouvre le téléchargement de l'APK (navigateur in-app), avec repli.
export async function openApkDownload(apkUrl) {
  const url = apkUrl || 'https://gextimo.novafriq.africa/'
  try {
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url })
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
