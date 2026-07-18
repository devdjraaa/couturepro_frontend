import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, X } from 'lucide-react'
import { onInstallable, promptInstall } from '@/utils/pwa'

const DISMISS_KEY = 'cp_pwa_banner_dismissed'

// P186 : bannière « Ajouter à l'écran d'accueil » (web uniquement — le module pwa.js
// est inerte en natif). Discrète, refusable (mémorisé 30 jours).
// Spec 130 : apparaît avec un léger différé, se retire toute seule après 12 s, et se
// place AU-DESSUS de la bulle Makila AI (plus jamais de superposition).
export default function PwaInstallBanner() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0)
    if (Date.now() - dismissedAt < 30 * 24 * 60 * 60 * 1000) return
    let apparition, retrait
    const off = onInstallable((installable) => {
      if (!installable) { setVisible(false); return }
      // différé de 4 s pour laisser la page respirer, retrait auto après 12 s d'affichage
      apparition = setTimeout(() => {
        setVisible(true)
        retrait = setTimeout(() => setVisible(false), 12000)
      }, 4000)
    })
    return () => { clearTimeout(apparition); clearTimeout(retrait); off?.() }
  }, [])

  if (!visible) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setVisible(false)
  }

  return (
    <div className="fixed bottom-24 inset-x-4 sm:left-auto sm:right-4 sm:w-96 z-[80] bg-card border border-edge rounded-2xl shadow-xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Download size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink">{t('pwa.installer_titre')}</p>
        <p className="text-xs text-dim">{t('pwa.installer_desc')}</p>
      </div>
      <button
        type="button"
        onClick={async () => { await promptInstall(); setVisible(false) }}
        className="shrink-0 text-xs font-semibold px-3 py-2 rounded-xl bg-primary text-inverse hover:bg-primary-600 transition-colors"
      >
        {t('pwa.installer_btn')}
      </button>
      <button type="button" onClick={dismiss} aria-label={t('commun.fermer')} className="shrink-0 text-ghost hover:text-ink transition-colors">
        <X size={16} />
      </button>
    </div>
  )
}
