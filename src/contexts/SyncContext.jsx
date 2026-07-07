import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNetwork } from '@/hooks/useNetwork'
import { useAuth } from '@/contexts/AuthContext'
import { syncWithServer, getLastPulledAt } from '@/db/syncAdapter'
import { scheduleOrderNotifications } from '@/utils/orderNotifications'
import database from '@/db/database'
import { Q } from '@nozbe/watermelondb'

const SyncContext = createContext(null)

// Tables suivies par la synchro (miroir de syncAdapter).
const SYNC_TABLES = ['clients', 'commandes', 'mesures', 'vetements']
// Pull périodique tant qu'on est en ligne : récupère les changements distants.
const POLL_INTERVAL_MS = 30000
// Anti-rafale : on regroupe les écritures locales successives avant de pousser.
const PUSH_DEBOUNCE_MS = 1200

export function SyncProvider({ children }) {
  const { isOnline, isNative } = useNetwork()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const [isSyncing,    setIsSyncing]    = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState(() => {
    const ts = getLastPulledAt()
    return ts ? new Date(ts).toISOString() : null
  })
  const [syncError, setSyncError] = useState(null)

  const prevOnline    = useRef(isOnline)
  // Miroirs synchrones pour les callbacks (observable / interval) : évitent
  // de recréer les effets à chaque changement d'état et les courses de rendu.
  const isSyncingRef  = useRef(false)
  const onlineRef     = useRef(isOnline)
  const authRef       = useRef(isAuthenticated)
  const debounceRef   = useRef(null)
  useEffect(() => { onlineRef.current = isOnline },        [isOnline])
  useEffect(() => { authRef.current   = isAuthenticated }, [isAuthenticated])

  const sync = useCallback(async () => {
    // Garde synchrone : jamais deux syncs en parallèle, jamais sans réseau/token.
    if (isSyncingRef.current) return
    if (!onlineRef.current || !authRef.current) return
    isSyncingRef.current = true
    setIsSyncing(true)
    setSyncError(null)
    try {
      await syncWithServer()
      setLastSyncedAt(new Date().toISOString())
      queryClient.invalidateQueries({ queryKey: ['notifications'] })

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
      isSyncingRef.current = false
      setIsSyncing(false)
    }
  }, [isNative, queryClient])

  // Push debouncé : déclenché après une écriture locale.
  const scheduleSync = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { sync() }, PUSH_DEBOUNCE_MS)
  }, [sync])

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

  // Push continu (H24 en ligne) : toute écriture locale remonte aussitôt au
  // serveur. Couvre aussi ce qui a été créé hors-ligne dès qu'on est en ligne.
  useEffect(() => {
    if (!isAuthenticated) return
    const sub = database
      .withChangesForTables(SYNC_TABLES)
      .subscribe(changes => {
        if (!changes) return                 // notification initiale : on ignore
        if (!onlineRef.current) return        // hors-ligne : le local prend le relais
        if (isSyncingRef.current) return      // écriture due au pull en cours : on ignore
        scheduleSync()
      })
    return () => sub.unsubscribe()
  }, [isAuthenticated, scheduleSync])

  // Pull périodique tant qu'on est en ligne : récupère les changements faits
  // ailleurs (autre appareil / web) et sert de filet de sécurité au push.
  useEffect(() => {
    if (!isOnline || !isAuthenticated) return
    const id = setInterval(() => { sync() }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [isOnline, isAuthenticated, sync])

  // Sync au retour au premier plan (les timers sont gelés en arrière-plan).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && onlineRef.current && authRef.current) {
        sync()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [sync])

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
