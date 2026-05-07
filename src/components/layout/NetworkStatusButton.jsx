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
 */
export default function NetworkStatusButton() {
  // Web : ce bouton n'a aucun sens (toujours online par convention)
  if (!Capacitor.isNativePlatform()) return null

  const { t } = useTranslation()
  const { isOnline, isSyncing, syncError, sync } = useSync()

  let Icon, color, spin = ''
  let label
  if (isSyncing) {
    Icon  = RefreshCw
    color = 'text-primary'
    spin  = 'animate-spin'
    label = t('sync.en_cours')
  } else if (!isOnline) {
    Icon  = WifiOff
    color = 'text-danger'
    label = t('sync.hors_ligne')
  } else if (syncError) {
    Icon  = Wifi
    color = 'text-warning'
    label = t('sync.erreur')
  } else {
    Icon  = Wifi
    color = 'text-success'
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
      className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-subtle transition-colors disabled:opacity-60 disabled:cursor-default"
    >
      <Icon size={18} className={`${color} ${spin}`} />
    </button>
  )
}
