import { useIsFetching } from '@tanstack/react-query'
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSync } from '@/contexts/SyncContext'

export default function SyncIndicator() {
  const { t } = useTranslation()
  const isFetching = useIsFetching()
  const { isOnline, isSyncing, syncError } = useSync()
  const [showSynced, setShowSynced] = useState(false)
  const prevSyncing = useState(false)

  // Flash "Synchronisé" 2s après la fin d'une sync
  useEffect(() => {
    if (!isSyncing && prevSyncing[0]) {
      setShowSynced(true)
      const t = setTimeout(() => setShowSynced(false), 2000)
      return () => clearTimeout(t)
    }
    prevSyncing[1](isSyncing)
  }, [isSyncing]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Hors ligne (priorité max) ─────────────────────────────────────────────
  if (!isOnline) {
    return (
      <div className="fixed top-0 inset-x-0 z-[70] flex items-center justify-center gap-2 px-4 py-2 bg-danger text-white text-xs font-medium shadow-lg">
        <WifiOff size={13} className="shrink-0" />
        <span>{t('sync.hors_ligne')}</span>
      </div>
    )
  }

  // ── En cours de sync ──────────────────────────────────────────────────────
  if (isSyncing) {
    return (
      <>
        <div className="fixed top-0 inset-x-0 z-[60] h-[2px] overflow-hidden">
          <div
            className="absolute inset-y-0 w-2/5 bg-primary rounded-full"
            style={{ animation: 'loading-progress 1.2s ease-in-out infinite' }}
          />
        </div>
        <div className="fixed top-2 right-3 z-[65] flex items-center gap-1.5 bg-card border border-edge rounded-full px-3 py-1 text-xs text-dim shadow-sm">
          <RefreshCw size={11} className="animate-spin text-primary" />
          <span>{t('sync.en_cours')}</span>
        </div>
      </>
    )
  }

  // ── Erreur de sync ────────────────────────────────────────────────────────
  if (syncError) {
    return (
      <div className="fixed top-0 inset-x-0 z-[70] flex items-center justify-center gap-2 px-4 py-2 bg-warning/90 text-white text-xs font-medium">
        <span>{t('sync.erreur')}</span>
      </div>
    )
  }

  // ── Flash "Synchronisé" ───────────────────────────────────────────────────
  if (showSynced) {
    return (
      <div className="fixed top-2 right-3 z-[65] flex items-center gap-1.5 bg-success/10 border border-success/30 rounded-full px-3 py-1 text-xs text-success shadow-sm">
        <CheckCircle size={11} />
        <span>{t('sync.synchronise')}</span>
      </div>
    )
  }

  // ── Fetch React Query en cours (barre discrète existante) ─────────────────
  if (isFetching) {
    return (
      <div className="fixed top-0 inset-x-0 z-[60] h-[2px] overflow-hidden">
        <div
          className="absolute inset-y-0 w-2/5 bg-primary rounded-full"
          style={{ animation: 'loading-progress 1.2s ease-in-out infinite' }}
        />
      </div>
    )
  }

  return null
}
