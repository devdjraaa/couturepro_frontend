import { Capacitor } from '@capacitor/core'
import { RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Bouton "Actualiser la page" dans le header (Android uniquement).
 * Tap = window.location.reload() — comportement web classique demandé
 * par le user. La WebView recharge l'index.html depuis https://localhost,
 * le bundle est en cache disque, l'app remonte vite. WatermelonDB
 * (IndexedDB) persiste, donc tout le state local est conservé.
 */
export default function RefreshButton() {
  if (!Capacitor.isNativePlatform()) return null

  const { t } = useTranslation()

  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      aria-label={t('sync.refresh')}
      title={t('sync.refresh')}
      className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-subtle transition-colors"
    >
      <RotateCw size={18} className="text-dim" />
    </button>
  )
}
