import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import { checkAppVersion, openApkDownload } from '@/utils/appUpdate'

// Vérifie la version native au démarrage et affiche un popup :
//  - 'required' → bloquant (pas de « plus tard »)
//  - 'optional' → « Plus tard » possible
// Le popup montre le changelog (nouveautés + corrections) fourni par le backend.
export default function AppUpdateGate() {
  const { t } = useTranslation()
  const [info, setInfo] = useState(null)     // { status, apkUrl, note, latest }
  const [dismissed, setDismissed] = useState(false)
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true
    checkAppVersion().then((res) => {
      if (res.status === 'required' || res.status === 'optional') setInfo(res)
    })
  }, [])

  if (!info || dismissed) return null
  const required = info.status === 'required'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-app/95 backdrop-blur">
      <div className="w-full max-w-sm bg-card border border-edge rounded-2xl p-6 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
          <Download size={26} />
        </div>
        <h2 className="text-lg font-bold font-display text-ink text-center">
          {required ? t('maj.requise_titre') : t('maj.dispo_titre')}
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

        {!required && (
          <button
            onClick={() => setDismissed(true)}
            className="mt-2 w-full text-sm font-semibold text-dim hover:text-ink py-2 transition"
          >
            {t('maj.plus_tard')}
          </button>
        )}
      </div>
    </div>
  )
}
