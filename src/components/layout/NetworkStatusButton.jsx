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
  const { isOnline, isSyncing, syncError, hasPending, sync } = useSync()
  const isHero = variant === 'hero'

  // Pastille claire (bg-subtle) dans les deux variantes → couleurs sémantiques.
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
    label = hasPending ? t('sync.en_attente') : t('sync.hors_ligne')
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
      className={`relative flex items-center justify-center transition-colors disabled:opacity-60 disabled:cursor-default ${
        isHero ? 'w-11 h-11 rounded-2xl bg-subtle hover:bg-edge shrink-0' : 'w-9 h-9 rounded-xl hover:bg-subtle'
      }`}
    >
      <Icon size={18} className={`${color} ${spin}`} />
      {/* P115 : pastille « changements en attente de synchronisation » */}
      {hasPending && !isSyncing && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-warning ring-2 ring-card" />
      )}
    </button>
  )
}
