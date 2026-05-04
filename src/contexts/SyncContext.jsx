import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNetwork } from '@/hooks/useNetwork'
import { flush, pull, getPendingCount, getLastPullAt } from '@/services/syncService'
import { QUERY_KEYS } from '@/hooks/queryKeys'
import { scheduleOrderNotifications } from '@/utils/orderNotifications'

const SyncContext = createContext(null)

export function SyncProvider({ children }) {
  const { isOnline, isNative } = useNetwork()
  const queryClient = useQueryClient()

  const [isSyncing,    setIsSyncing]    = useState(false)
  const [pendingCount, setPendingCount] = useState(() => getPendingCount())
  const [lastSyncedAt, setLastSyncedAt] = useState(() => getLastPullAt())
  const [syncError,    setSyncError]    = useState(null)

  const prevOnline = useRef(isOnline)

  const refreshPendingCount = useCallback(() => {
    setPendingCount(getPendingCount())
  }, [])

  const sync = useCallback(async () => {
    if (isSyncing) return
    setIsSyncing(true)
    setSyncError(null)
    try {
      // 1. Pousser les mutations en attente
      const { failed } = await flush()
      refreshPendingCount()

      // 2. Tirer les données fraîches du serveur
      const pulled = await pull()

      // 3. Invalider les caches concernés pour forcer un refetch
      if (pulled) {
        const resources = Object.keys(pulled.data ?? {})
        const invalidations = []
        if (resources.includes('clients'))   invalidations.push(QUERY_KEYS.clients)
        if (resources.includes('commandes')) invalidations.push(QUERY_KEYS.commandes)
        if (resources.includes('mesures'))   invalidations.push(['mesures'])
        if (resources.includes('vetements')) invalidations.push(QUERY_KEYS.vetements)

        await Promise.all(
          invalidations.map(key => queryClient.invalidateQueries({ queryKey: key }))
        )
      }

      setLastSyncedAt(new Date().toISOString())
      if (failed > 0) setSyncError(`${failed} action(s) non synchronisée(s).`)

      // Re-planifier les notifications après chaque sync
      const commandes = queryClient.getQueryData(QUERY_KEYS.commandes) ?? []
      scheduleOrderNotifications(Array.isArray(commandes) ? commandes : commandes?.data ?? [])
    } catch (err) {
      setSyncError(err?.message ?? 'Erreur de synchronisation.')
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing, queryClient, refreshPendingCount])

  // Planifier les notifications au démarrage si des commandes sont déjà en cache
  useEffect(() => {
    if (!isNative) return
    const commandes = queryClient.getQueryData(QUERY_KEYS.commandes) ?? []
    const list = Array.isArray(commandes) ? commandes : commandes?.data ?? []
    if (list.length > 0) scheduleOrderNotifications(list)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-flush dès que la connexion revient (mobile uniquement — en web l'utilisateur est toujours en ligne)
  useEffect(() => {
    const wasOffline = !prevOnline.current
    prevOnline.current = isOnline

    if (isOnline && wasOffline && (isNative || pendingCount > 0)) {
      sync()
    }
  }, [isOnline, isNative, pendingCount, sync])

  return (
    <SyncContext.Provider value={{ isOnline, isNative, isSyncing, pendingCount, lastSyncedAt, syncError, sync, refreshPendingCount }}>
      {children}
    </SyncContext.Provider>
  )
}

export function useSync() {
  const ctx = useContext(SyncContext)
  if (!ctx) throw new Error('useSync doit être utilisé à l\'intérieur de SyncProvider')
  return ctx
}
