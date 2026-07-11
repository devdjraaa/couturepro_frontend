import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import { checkAppVersion, openApkDownload } from '@/utils/appUpdate'

// Snooze du popup de mise à jour optionnelle : « Plus tard » masque le popup
// pendant 7 jours ; au-delà, il revient mais SANS « Plus tard » (téléchargement
// forcé). Une MAJ obligatoire (min_version) est toujours bloquante.
const SNOOZE_KEY = 'gx_maj_snooze' // { version, until }
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000

function readSnooze() {
  try { return JSON.parse(localStorage.getItem(SNOOZE_KEY) || 'null') } catch { return null }
}

export default function AppUpdateGate() {
  const { t } = useTranslation()
  const [info, setInfo] = useState(null) // { status, latest, apkUrl, note, forced }
  const [dismissed, setDismissed] = useState(false)
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true
    checkAppVersion().then((res) => {
      if (res.status === 'ok') {
        // À jour → on efface un éventuel snooze (repart propre pour la prochaine version).
        try { localStorage.removeItem(SNOOZE_KEY) } catch { /* indispo */ }
        return
      }
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
          onClick={() => openApkDownload(info.apkUrl)}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-600 transition"
        >
          <Download size={17} /> {t('maj.telecharger')}
        </button>

        {!info.forced && (
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
