// Mises à jour de l'app :
//  - OTA (bundle web) : gérée par @capgo/capacitor-updater en auto-update.
//    notifyAppReady() confirme que le bundle démarre bien (sinon rollback Capgo).
//  - Version native (grosse MAJ) : on interroge le backend /app/version et on
//    compare à la version installée pour proposer / imposer le téléchargement APK.
//
// RÉGLAGE `autoUpdate: 'atBackground'` (capacitor.config.json) — pas le défaut
// historique de ce projet (`directUpdate: true`, équivalent à `'always'`).
// `'always'` recharge le bundle à CHAQUE retour au premier plan, y compris en
// pleine saisie d'une commande : un artisan qui reçoit un appel, quitte l'app
// trois secondes et y revient aurait perdu sa saisie, sans qu'aucun état ne
// soit sauvegardé pour la lui rendre. `'atBackground'` applique la mise à jour
// quand l'app PASSE en arrière-plan — jamais pendant qu'on la regarde.
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

// Confirmation du bundle OTA — le filet de sécurité de Capgo.
//
// Tant que `notifyAppReady()` n'est pas appelé, Capgo considère le bundle comme
// non validé et revient au précédent au prochain démarrage. Encore faut-il ne
// pas le confirmer trop tôt : l'appel se faisait au CHARGEMENT DU MODULE, donc
// tout bundle qui se parse était déclaré sain. Le 21/07, un bundle qui plantait
// à l'écran a ainsi été confirmé « success » et l'application est restée morte
// sur l'appareil — le filet existait, il ne pouvait simplement pas se déclencher.
//
// Désormais la confirmation demande DEUX preuves :
//   1. l'arbre React a monté (`signalerAppMontee`) — sinon rien ne s'affiche ;
//   2. il a tenu quelques secondes sans que le garde-fou global se déclenche.
// Un plantage au premier écran annule définitivement la confirmation, et Capgo
// rend la main à la version précédente.

// Large devant un démarrage normal, court devant le délai de Capgo : on veut
// laisser passer le premier rendu, pas attendre que l'utilisateur navigue.
const DELAI_CONFIRMATION_MS = 8000

let minuteur = null
let condamne = false

// Le 22/07, la version 1.0.143 a échoué en silence sur un appareil de test :
// rien ne l'aurait signalé sans un test manuel, appareil branché. Un atelier
// dont la mise à jour échoue en continu ne le signale jamais de lui-même — il
// ignore même qu'une version plus récente existe. `/app/ota-evenement` inverse
// la charge de la preuve : l'appareil rapporte l'ISSUE de chaque tentative,
// succès ou échec, et un tableau de bord peut désormais voir un incident réel
// au lieu d'attendre qu'un humain teste à la main.
//
// Fire-and-forget assumé : un appareil hors ligne ne peut de toute façon pas
// prévenir de son propre échec de connexion, et bloquer sur cet appel
// retarderait une confirmation qui, elle, ne doit jamais attendre le réseau.
function rapporterEvenementOta(evenement, version, detail) {
  if (!IS_NATIVE || !version) return
  api.post('/app/ota-evenement', {
    app_id: 'com.couturepro.app',
    version,
    evenement,
    detail: detail ? String(detail).slice(0, 300) : undefined,
  }).catch(() => { /* rien à faire : le prochain événement retentera */ })
}

async function confirmerAupresDeCapgo() {
  try {
    const { CapacitorUpdater } = await import('@capgo/capacitor-updater')
    const bundleActuel = await CapacitorUpdater.current().catch(() => null)
    await CapacitorUpdater.notifyAppReady()
    rapporterEvenementOta('succes', bundleActuel?.bundle?.version)
  } catch { /* plugin absent (web) : rien à faire */ }
}

/** L'arbre React a monté : on lance le compte à rebours de confirmation. */
export function signalerAppMontee() {
  if (!IS_NATIVE || condamne || minuteur) return
  minuteur = setTimeout(() => { minuteur = null; confirmerAupresDeCapgo() }, DELAI_CONFIRMATION_MS)
}

// Enregistré une seule fois au démarrage (voir ConfirmationBundle) : le bundle
// EN COURS D'EXÉCUTION — donc, par définition, celui qui fonctionne encore —
// est le seul capable de rapporter qu'un téléchargement ou qu'une application
// de mise à jour a échoué en arrière-plan. Le bundle défaillant, lui, ne
// démarre jamais assez pour prévenir de rien.
let ecouteursPoses = false
export async function surveillerMisesAJourOta() {
  if (!IS_NATIVE || ecouteursPoses) return
  ecouteursPoses = true
  try {
    const { CapacitorUpdater } = await import('@capgo/capacitor-updater')
    CapacitorUpdater.addListener('downloadFailed', (e) => {
      rapporterEvenementOta('echec_telechargement', e?.version)
    })
    CapacitorUpdater.addListener('updateFailed', (e) => {
      rapporterEvenementOta('echec_application', e?.bundle?.version, e?.bundle?.status)
    })
  } catch { /* plugin absent (web) : rien à faire */ }
}

/**
 * Le garde-fou global s'est déclenché : ce bundle ne démarre pas correctement.
 * On ne le confirme jamais — y compris s'il plante après coup, car un bundle
 * qui tombe une fois retombera.
 */
export function signalerDemarrageRate() {
  condamne = true
  if (minuteur) { clearTimeout(minuteur); minuteur = null }
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
