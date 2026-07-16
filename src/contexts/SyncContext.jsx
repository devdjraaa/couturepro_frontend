import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Bell } from 'lucide-react'
import { useNetwork } from '@/hooks/useNetwork'
import { useAuth } from '@/contexts/AuthContext'
import { syncWithServer, getLastPulledAt } from '@/db/syncAdapter'
import { scheduleOrderNotifications } from '@/utils/orderNotifications'
import { raiseSystemNotifications } from '@/utils/localNotif'
import { goToDeepLink } from '@/utils/deepLink'
import database from '@/db/database'
import { Q } from '@nozbe/watermelondb'
import { hasUnsyncedChanges } from '@nozbe/watermelondb/sync'

const SyncContext = createContext(null)

// Bannière in-app cliquable pour les nouvelles notifications (app au premier plan).
// Tap → redirige vers l'écran lié (même deep-link que le rideau).
function notifierInApp(fresh) {
  const n = fresh[fresh.length - 1]           // la plus récente
  if (!n?.titre) return
  const extra = fresh.length > 1 ? ` (+${fresh.length - 1})` : ''
  toast.custom((tp) => (
    <button
      type="button"
      onClick={() => { toast.dismiss(tp.id); if (n.lien) goToDeepLink(n.lien) }}
      className="flex items-start gap-3 bg-card border border-edge rounded-2xl shadow-lg px-4 py-3 w-[min(92vw,22rem)] text-left active:scale-[0.98] transition"
    >
      <span className="mt-0.5 w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Bell size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink truncate">{n.titre}{extra}</span>
        {n.contenu ? <span className="block text-xs text-dim truncate">{n.contenu}</span> : null}
      </span>
    </button>
  ), { duration: 5000, position: 'top-center' })
}

// Tables suivies par la synchro (miroir de syncAdapter).
const SYNC_TABLES = ['clients', 'commandes', 'mesures', 'vetements', 'collections', 'notifications', 'paiements', 'commande_items', 'commande_echeances']
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
  // P115 : y a-t-il des écritures locales pas encore remontées au serveur ?
  const [hasPending, setHasPending] = useState(false)

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
      // P39 : après sync, le serveur a pu créditer des points (client/commande) →
      // on rafraîchit le solde pour que le watcher affiche « +X pts ».
      queryClient.invalidateQueries({ queryKey: ['points'] })
    } catch (err) {
      // La synchro peut échouer sur sa phase PUSH ; le PULL a déjà mis à jour le DB
      // local. On n'empêche donc pas les notifications ci-dessous.
      setSyncError(err?.message ?? 'Erreur de synchronisation.')
    }

    // P115 : reste-t-il des changements locaux en attente (push échoué / hors-ligne) ?
    try { setHasPending(await hasUnsyncedChanges(database)) } catch { /* indisponible */ }

    // Notifications locales — basées sur le DB local (déjà à jour par le pull),
    // exécutées même si le push a échoué. Chaque bloc est indépendant.
    if (isNative) {
      try {
        const commandes = await database.get('commandes')
          .query(Q.where('statut', 'en_cours'), Q.where('is_archived', false))
          .fetch()
        scheduleOrderNotifications(commandes)
      } catch { /* planification livraisons indisponible */ }

      try {
        // Rideau + pop in-app pour les notifications système nouvellement arrivées
        // (remplace le push FCM ; suivi par IDs pour ne signaler que les nouvelles).
        const notifs = await database.get('notifications').query().fetch()
        // silent : la notification native (rideau) arrive en TEMPS RÉEL via FCM.
        // Ici on ne détecte que les nouvelles pour la bannière in-app (app au 1er plan).
        const fresh = await raiseSystemNotifications(notifs, { silent: true })
        if (fresh.length && (typeof document === 'undefined' || document.visibilityState === 'visible')) {
          notifierInApp(fresh)
        }
      } catch { /* notifications indisponibles */ }
    }

    isSyncingRef.current = false
    setIsSyncing(false)
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
        if (isSyncingRef.current) return      // écriture due au pull en cours : on ignore
        // Hors-ligne : on marque « en attente » (le local prend le relais) ;
        // en ligne : on planifie la remontée (qui recalculera hasPending).
        if (!onlineRef.current) { setHasPending(true); return }
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
    <SyncContext.Provider value={{ isOnline, isNative, isSyncing, lastSyncedAt, syncError, hasPending, sync }}>
      {children}
    </SyncContext.Provider>
  )
}

export function useSync() {
  const ctx = useContext(SyncContext)
  if (!ctx) throw new Error('useSync doit être utilisé à l\'intérieur de SyncProvider')
  return ctx
}
