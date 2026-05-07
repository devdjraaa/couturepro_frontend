import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useNetwork } from '@/hooks/useNetwork'
import { useAuth } from '@/contexts/AuthContext'
import { syncWithServer, getLastPulledAt } from '@/db/syncAdapter'
import { scheduleOrderNotifications } from '@/utils/orderNotifications'
import database from '@/db/database'
import { Q } from '@nozbe/watermelondb'

const SyncContext = createContext(null)

export function SyncProvider({ children }) {
  const { isOnline, isNative } = useNetwork()
  const { isAuthenticated } = useAuth()

  const [isSyncing,    setIsSyncing]    = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState(() => {
    const ts = getLastPulledAt()
    return ts ? new Date(ts).toISOString() : null
  })
  const [syncError, setSyncError] = useState(null)

  const prevOnline = useRef(isOnline)

  const sync = useCallback(async () => {
    if (isSyncing) return
    setIsSyncing(true)
    setSyncError(null)
    try {
      await syncWithServer()
      setLastSyncedAt(new Date().toISOString())

      // Re-planifier les notifications après chaque sync
      if (isNative) {
        const commandes = await database.get('commandes')
          .query(Q.where('statut', 'en_cours'), Q.where('is_archived', false))
          .fetch()
        scheduleOrderNotifications(commandes)
      }
    } catch (err) {
      setSyncError(err?.message ?? 'Erreur de synchronisation.')
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing, isNative])

  // Auto-sync dès que la connexion revient (et seulement si authentifié)
  useEffect(() => {
    const wasOffline = !prevOnline.current
    prevOnline.current = isOnline

    if (isOnline && wasOffline && isAuthenticated) {
      sync()
    }
  }, [isOnline, isAuthenticated, sync])

  // Sync initial dès que l'utilisateur est authentifié et en ligne
  // (ne tente JAMAIS de syncer sans token, sinon 401 → "Erreur de synchronisation")
  useEffect(() => {
    if (isOnline && isAuthenticated) sync()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  return (
    <SyncContext.Provider value={{ isOnline, isNative, isSyncing, lastSyncedAt, syncError, sync }}>
      {children}
    </SyncContext.Provider>
  )
}

export function useSync() {
  const ctx = useContext(SyncContext)
  if (!ctx) throw new Error('useSync doit être utilisé à l\'intérieur de SyncProvider')
  return ctx
}
