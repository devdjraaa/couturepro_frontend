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
    await downloadAndInstallApk(info.apkUrl, setProgress)
    setBusy(false)
    setDismissed(true) // l'installateur Android (ou le repli navigateur) a pris le relais
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-app/95 backdrop-blur">
      <div className="w-full max-w-sm bg-card border border-edge rounded-2xl p-6 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
          <Download size={26} />
        </div>
        <h2 className="text-lg font-bold font-display text-ink text-center">
          {info.status === 'required' ? t('maj.requise_titre') : t('maj.dispo_titre')}
          {info.latest ? <span className="text-dim font-normal"> · v{info.latest}</span> : null}
        </h2>

        {info.note
          ? (
            <div className="mt-3">
              <p className="text-xs font-semibold text-ghost uppercase tracking-wider mb-1.5">{t('maj.changelog')}</p>
              <div className="text-sm text-dim whitespace-pre-line max-h-52 overflow-y-auto bg-subtle rounded-xl p-3">
                {info.note}
              </div>
            </div>
          )
          : <p className="mt-2 text-sm text-dim text-center">{t('maj.requise_desc')}</p>}

        <button
          onClick={download}
          disabled={busy}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-600 transition disabled:opacity-80"
        >
          <Download size={17} />
          {busy
            ? `${t('maj.telechargement')}${progress != null ? ` ${progress}%` : '…'}`
            : t('maj.telecharger')}
        </button>

        {busy && progress != null && (
          <div className="mt-2 h-1.5 rounded-full bg-subtle overflow-hidden">
            <div className="h-full bg-primary transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
        )}

        {!info.forced && !busy && (
          <button
            onClick={later}
            className="mt-2 w-full text-sm font-semibold text-dim hover:text-ink py-2 transition"
          >
            {t('maj.plus_tard')}
          </button>
        )}
      </div>
    </div>
  )
}
