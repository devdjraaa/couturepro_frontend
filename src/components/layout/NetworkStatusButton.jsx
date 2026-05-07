import { Capacitor } from '@capacitor/core'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSync } from '@/contexts/SyncContext'

/**
 * Icône WiFi 3 états dans le header (Android uniquement).
 *  - vert    : online idle
 *  - orange  : online avec une erreur de sync persistante
 *  - rouge   : offline
 *  - spinner : sync en cours
 *
 * Tap = déclenche un sync manuel quand online + non syncing.
 *
 * variant :
 *  - 'default' (par défaut) : couleurs sémantiques sur fond clair (header standard)
 *  - 'hero'                 : version pour fond coloré (bleu primary du dashboard)
 */
export default function NetworkStatusButton({ variant = 'default' }) {
  // Web : ce bouton n'a aucun sens (toujours online par convention)
  if (!Capacitor.isNativePlatform()) return null

  const { t } = useTranslation()
  const { isOnline, isSyncing, syncError, sync } = useSync()
  const isHero = variant === 'hero'

  let Icon, color, spin = ''
  let label
  if (isSyncing) {
    Icon  = RefreshCw
    color = isHero ? 'text-inverse' : 'text-primary'
    spin  = 'animate-spin'
    label = t('sync.en_cours')
  } else if (!isOnline) {
    Icon  = WifiOff
    // En hero, on garde inverse mais avec opacité pour signaler "ko"
    color = isHero ? 'text-warning' : 'text-danger'
    label = t('sync.hors_ligne')
  } else if (syncError) {
    Icon  = Wifi
    color = isHero ? 'text-warning' : 'text-warning'
    label = t('sync.erreur')
  } else {
    Icon  = Wifi
    color = isHero ? 'text-inverse' : 'text-success'
    label = t('sync.online')
  }

  const handleClick = () => {
    if (isOnline && !isSyncing) sync()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isOnline || isSyncing}
      aria-label={label}
      title={label}
      className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors disabled:opacity-60 disabled:cursor-default ${
        isHero ? 'hover:bg-inverse/10' : 'hover:bg-subtle'
      }`}
    >
      <Icon size={18} className={`${color} ${spin}`} />
    </button>
  )
}
