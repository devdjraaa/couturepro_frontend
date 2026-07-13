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

// Force une vérification OTA (bundle web) + application immédiate.
// Utilisé par le bouton « Mettre à jour maintenant ». Si une MAJ est trouvée,
// l'app se recharge automatiquement (set) → pas de cache à vider.
export async function forceCheckOta() {
  if (!IS_NATIVE) return { updated: false }
  try {
    const { CapacitorUpdater } = await import('@capgo/capacitor-updater')
    const latest = await CapacitorUpdater.getLatest()
    if (!latest?.url || !latest?.version) return { updated: false }
    const current = await CapacitorUpdater.current().catch(() => null)
    if (current?.bundle?.version && current.bundle.version === latest.version) {
      return { updated: false } // déjà sur ce bundle
    }
    const bundle = await CapacitorUpdater.download({ version: latest.version, url: latest.url })
    await CapacitorUpdater.set({ id: bundle.id }) // applique + recharge l'app
    return { updated: true }
  } catch {
    return { updated: false, error: true }
  }
}

// Ouvre le téléchargement de l'APK (navigateur in-app), avec repli.
// Télécharge l'APK DANS l'app (barre de progression) puis ouvre directement
// l'installateur Android — sans passer par le navigateur. C'est le vrai
// self-update : l'utilisateur reste dans l'app, tape « Installer », c'est fini.
// onProgress(pct) est appelé pendant le téléchargement (0..100).
// Repli automatique sur le navigateur si un plugin manque (anciennes APK).
export async function downloadAndInstallApk(apkUrl, onProgress) {
  const url = apkUrl || 'https://gextimo.novafriq.africa/Gextimo.apk'
  if (!IS_NATIVE) { window.open(url, '_blank', 'noopener,noreferrer'); return { ok: false, web: true } }
  let handle
  try {
    const { Filesystem, Directory } = await import('@capacitor/filesystem')
    const { FileOpener } = await import('@capacitor-community/file-opener')
    if (onProgress) {
      handle = await Filesystem.addListener('progress', (e) => {
        if (e?.contentLength) onProgress(Math.min(100, Math.round((e.bytes / e.contentLength) * 100)))
      })
    }
    // Nom unique par session pour éviter de rouvrir un vieux fichier en cache.
    const name = `Gextimo-${Date.now()}.apk`
    const res = await Filesystem.downloadFile({ url, path: name, directory: Directory.Cache, progress: true })
    if (handle) { await handle.remove(); handle = null }
    let filePath = res?.path
    if (!filePath) filePath = (await Filesystem.getUri({ path: name, directory: Directory.Cache })).uri
    await FileOpener.open({ filePath, contentType: 'application/vnd.android.package-archive' })
    return { ok: true }
  } catch (e) {
    if (handle) { try { await handle.remove() } catch { /* noop */ } }
    // Repli : ouvre le navigateur système (comportement précédent).
    await openApkDownload(url)
    return { ok: false, fallback: true, error: String(e) }
  }
}

export async function openApkDownload(apkUrl) {
  const url = apkUrl || 'https://gextimo.novafriq.africa/'
  // 1) Navigateur SYSTÈME (Chrome en app) → téléchargement via DownloadManager.
  //    Un Custom Tab (Browser.open) laisse le téléchargement « en attente » (bug connu).
  try {
    const { AppLauncher } = await import('@capacitor/app-launcher')
    await AppLauncher.openUrl({ url })
    return
  } catch { /* plugin absent (ancienne APK / web) : replis ci-dessous */ }
  try {
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url })
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
