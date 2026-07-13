import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import { checkAppVersion, downloadAndInstallApk } from '@/utils/appUpdate'
import { showLocalNotif } from '@/utils/localNotif'

// Ne notifie qu'une fois par version (évite le spam à chaque ouverture).
const NOTIFIED_KEY = 'gx_update_notified'
async function notifyBigUpdateOnce(res, t) {
  try {
    if (!res.latest || localStorage.getItem(NOTIFIED_KEY) === res.latest) return
    localStorage.setItem(NOTIFIED_KEY, res.latest)
  } catch { /* localStorage indispo : on notifie quand même */ }
  // Tap → deep-link vers Réglages (la zone « Mises à jour » y figure).
  await showLocalNotif('Gextimo', t('maj.notif_body', { version: res.latest }), { lien: '/parametres' })
}

// Snooze du popup de mise à jour optionnelle : « Plus tard » masque le popup
// pendant 7 jours ; au-delà, il revient mais SANS « Plus tard » (téléchargement
// forcé). Une MAJ obligatoire (min_version) est toujours bloquante.
const SNOOZE_KEY = 'gx_maj_snooze' // { version, until }
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000
// Version pour laquelle l'utilisateur a déjà lancé le téléchargement : on ne
// re-affiche plus le popup pour CETTE version (il l'installe). Il ne reviendra
// qu'à la sortie d'une version encore plus récente.
const HANDLED_KEY = 'gx_maj_handled' // string = version téléchargée

function readSnooze() {
  try { return JSON.parse(localStorage.getItem(SNOOZE_KEY) || 'null') } catch { return null }
}
function readHandled() {
  try { return localStorage.getItem(HANDLED_KEY) } catch { return null }
}

export default function AppUpdateGate() {
  const { t } = useTranslation()
  const [info, setInfo] = useState(null) // { status, latest, apkUrl, note, forced }
  const [dismissed, setDismissed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(null) // 0..100 pendant le téléchargement
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true
    checkAppVersion().then((res) => {
      if (res.status === 'ok') {
        // À jour → on repart propre (efface snooze + « déjà téléchargé ») pour la prochaine version.
        try { localStorage.removeItem(SNOOZE_KEY); localStorage.removeItem(HANDLED_KEY) } catch { /* indispo */ }
        return
      }
      // Déjà téléchargée par l'utilisateur → on n'insiste plus (ni popup ni notif)
      // jusqu'à ce qu'une version encore plus récente sorte.
      if (readHandled() === res.latest) return
      // Grosse MAJ détectée → notification système (tap = deep-link vers Réglages).
      notifyBigUpdateOnce(res, t)
      if (res.status === 'required') {
        setInfo({ ...res, forced: true }) // obligatoire : toujours bloquant
        return
      }
      // Optionnelle : gestion du snooze
      const snooze = readSnooze()
      if (snooze && snooze.version === res.latest) {
        if (Date.now() < snooze.until) return            // encore dans les 7 jours → rien
        setInfo({ ...res, forced: true })                // 7 jours passés → forcé (sans « Plus tard »)
        return
      }
      setInfo({ ...res, forced: false })                 // 1ʳᵉ fois → avec « Plus tard »
    })
  }, [])

  if (!info || dismissed) return null

  const later = () => {
    try {
      localStorage.setItem(SNOOZE_KEY, JSON.stringify({ version: info.latest, until: Date.now() + SNOOZE_MS }))
    } catch { /* indispo */ }
    setDismissed(true)
  }

  // « Télécharger » : télécharge l'APK DANS l'app (barre de progression) puis
  // ouvre directement l'installateur Android. On marque la version comme traitée.
  const download = async () => {
    if (busy) return
    try { localStorage.setItem(HANDLED_KEY, info.latest) } catch { /* indispo */ }
    setBusy(true); setProgress(0)
    // Notif visible s'il quitte l'app pendant le téléchargement.
    showLocalNotif('Gextimo', `${t('maj.telechargement')}…`, { lien: '/' })
    await downloadAndInstallApk(info.apkUrl, setProgress)
    setBusy(false)
    setDismissed(true) // l'installateur Android (ou le repli navigateur) a pris le relais
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-app">
      {/* Haut : logo officiel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
        <div className="w-28 h-28 rounded-[26px] bg-white shadow-xl flex items-center justify-center">
          <img src="/favicon-512.png" alt="Gextimo" className="w-20 h-20" draggable="false" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold font-display text-ink text-balance">
            {info.status === 'required' ? t('maj.requise_titre') : t('maj.dispo_titre')}
          </h1>
          {info.latest && <p className="text-dim mt-1 text-sm">v{info.latest}</p>}
        </div>
      </div>

      {/* Bas : nouveautés + actions (les boutons cèdent la place à la progression) */}
      <div className="px-6 pb-10 pt-2 space-y-4 w-full max-w-md mx-auto">
        {info.note && (
          <div className="bg-card border border-edge rounded-2xl p-4 max-h-40 overflow-y-auto">
            <p className="text-xs font-semibold text-ghost uppercase tracking-wider mb-1.5">{t('maj.changelog')}</p>
            <div className="text-sm text-dim whitespace-pre-line">{info.note}</div>
          </div>
        )}

        {busy ? (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dim">{t('maj.telechargement')}</span>
              <span className="font-bold text-ink tabular-nums">{progress != null ? `${progress}%` : '…'}</span>
            </div>
            <div className="h-2.5 rounded-full bg-subtle overflow-hidden">
              <div className="h-full bg-primary transition-all duration-200" style={{ width: `${progress || 0}%` }} />
            </div>
            <p className="text-xs text-ghost text-center pt-1">{t('maj.installation_auto')}</p>
          </div>
        ) : (
          <>
            <button
              onClick={download}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-primary text-white font-semibold hover:bg-primary-600 transition shadow-lg shadow-primary/20"
            >
              <Download size={18} /> {t('maj.telecharger')}
            </button>
            {!info.forced && (
              <button
                onClick={later}
                className="w-full text-sm font-semibold text-dim hover:text-ink py-2.5 transition"
              >
                {t('maj.plus_tard')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
