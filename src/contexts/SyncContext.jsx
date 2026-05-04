import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useNetwork } from '@/hooks/useNetwork'
import { syncWithServer, getLastPulledAt } from '@/db/syncAdapter'
import { scheduleOrderNotifications } from '@/utils/orderNotifications'
import database from '@/db/database'
import { Q } from '@nozbe/watermelondb'

const SyncContext = createContext(null)

export function SyncProvider({ children }) {
  const { isOnline, isNative } = useNetwork()

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

  // Auto-sync dès que la connexion revient
  useEffect(() => {
    const wasOffline = !prevOnline.current
    prevOnline.current = isOnline

    if (isOnline && wasOffline) {
      sync()
    }
  }, [isOnline, sync])

  // Sync initial au démarrage si online
  useEffect(() => {
    if (isOnline) sync()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
