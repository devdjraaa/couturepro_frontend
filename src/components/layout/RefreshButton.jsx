import { Capacitor } from '@capacitor/core'
import { RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Bouton "Actualiser la page" dans le header (Android uniquement).
 * Tap = window.location.reload() — comportement web classique.
 *
 * variant :
 *  - 'default' : couleurs sémantiques sur fond clair (header standard)
 *  - 'hero'    : version pour fond coloré (bleu primary du dashboard)
 */
export default function RefreshButton({ variant = 'default' }) {
  if (!Capacitor.isNativePlatform()) return null

  const { t } = useTranslation()
  const isHero = variant === 'hero'

  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      aria-label={t('sync.refresh')}
      title={t('sync.refresh')}
      className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
        isHero ? 'hover:bg-inverse/10' : 'hover:bg-subtle'
      }`}
    >
      <RotateCw size={18} className={isHero ? 'text-inverse' : 'text-dim'} />
    </button>
  )
}
