import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '@/services/authService'
import {
  getToken, clearAll,
  getCachedSession, setCachedSession, clearCachedSession,
  getMaxOfflineMs,
} from '@/utils/storage'
import { setDemoMode } from '@/services/mockFlag'
import { setActiveAtelierId } from '@/services/api'
import { clearSyncState } from '@/db/syncAdapter'
import { showLocalNotif } from '@/utils/localNotif'

// ── Permissions par rôle ──────────────────────────────────────────────────────
const ROLE_PERMISSIONS = {
  proprietaire: [
    'clients.view', 'clients.create', 'clients.archive', 'clients.edit', 'clients.delete',
    'commandes.view', 'commandes.create', 'commandes.archive', 'commandes.edit', 'commandes.delete',
    'mesures.view', 'mesures.archive', 'mesures.edit',
    'vetements.manage',
    'equipe.manage',
    'abonnement.manage',
    'parametres.manage',
    'points.convert',
    'notifications.view',
  ],
  // CDC §4.3 — assistant : CREATE + READ + ARCHIVE (pas d'UPDATE ni DELETE)
  assistant: [
    'clients.view', 'clients.create', 'clients.archive',
    'commandes.view', 'commandes.create', 'commandes.archive',
    'mesures.view', 'mesures.archive',
    'vetements.manage',
    'notifications.view',
  ],
  // Membre : READ uniquement
  membre: [
    'clients.view',
    'commandes.view',
    'mesures.view',
    'notifications.view',
  ],
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null)
  const [atelier,   setAtelier]   = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restaurer la session au démarrage (CDC : 30 jours offline, revalidation 7j online)
  useEffect(() => {
    if (!getToken()) { setIsLoading(false); return }

    // 1) Hydrate immédiatement depuis le cache local si présent et non expiré
    const cached = getCachedSession()
    if (cached?.user) {
      const ageMs   = Date.now() - (cached.last_validated_at ?? cached.cached_at ?? 0)
      const limitMs = getMaxOfflineMs(cached.user.role)
      if (ageMs < limitMs) {
        setUser(cached.user)
        setAtelier(cached.atelier)
        setDemoMode(!!cached.atelier?.is_demo)
        setIsLoading(false)
      } else {
        // Cache trop vieux (CDC §1.2 : 30j gérant / 7j équipe) → forcer la reconnexion
        clearAll()
        clearCachedSession()
        setIsLoading(false)
        return
      }
    }

    // 2) Tenter de revalider en arrière-plan (no-op si offline)
    authService.getMe()
      .then(({ user, atelier }) => {
        setUser(user)
        setAtelier(atelier)
        setDemoMode(!!atelier?.is_demo)
        setCachedSession({ user, atelier })
      })
      .catch((err) => {
        // 401 → l'intercepteur a déjà clearAll() + redirect
        // network error → on garde le cache, l'utilisateur reste connecté offline
        if (err?.code === 'reseau') {
          // pas d'action — la session cachée est toujours valide
        }
      })
      .finally(() => {
        if (!cached) setIsLoading(false)
      })
  }, [])

  const login = useCallback(async (payload) => {
    const { user, atelier } = await authService.login(payload)
    setUser(user)
    setAtelier(atelier)
    setDemoMode(!!atelier?.is_demo)
    setCachedSession({ user, atelier })
    showLocalNotif('Connexion réussie', `Bienvenue, ${user.prenom || user.nom} !`)
  }, [])

  const equipeLogin = useCallback(async (payload) => {
    const { user } = await authService.equipeLogin(payload)
    setUser(user)
    setAtelier(null)
    setDemoMode(false)
    setCachedSession({ user, atelier: null })
  }, [])

  const logout = useCallback(async () => {
    setUser(null)
    setAtelier(null)
    setDemoMode(false)
    clearAll()
    clearCachedSession()
    clearSyncState()
    try { await authService.logout() } catch { /* offline */ }
  }, [])

  const register = useCallback((payload) => authService.register(payload), [])

  const verifyOtp = useCallback(async (payload) => {
    const { user, atelier } = await authService.verifyOtp(payload)
    setUser(user)
    setAtelier(atelier)
    setDemoMode(!!atelier?.is_demo)
    setCachedSession({ user, atelier })
  }, [])

  const resendOtp = useCallback((telephone) => authService.resendOtp(telephone), [])

  const activateCode = useCallback((code) => authService.activateCode(code), [])

  // Mettre à jour les données atelier localement (ex: après upgrade abonnement)
  const refreshAtelier = useCallback(async () => {
    const { atelier: fresh } = await authService.getMe()
    setAtelier(fresh)
  }, [])

  const updateAtelierLocal = useCallback((partial) => {
    setAtelier(prev => prev ? { ...prev, ...partial } : prev)
  }, [])

  // Bascule vers un autre atelier du propriétaire (multi-atelier)
  const switchAtelier = useCallback((newAtelier) => {
    const isMaitre = newAtelier.is_maitre
    setAtelier(newAtelier)
    setActiveAtelierId(isMaitre ? null : newAtelier.id)
  }, [])

  const can = useCallback((permission) => {
    if (!user) return false
    // Proprietaire : permissions statiques complètes
    if (user.role === 'proprietaire') {
      return ROLE_PERMISSIONS.proprietaire.includes(permission)
    }
    // Membres d'équipe : permissions dynamiques chargées au login
    return Array.isArray(user.permissions) && user.permissions.includes(permission)
  }, [user])

  return (
    <AuthContext.Provider value={{
      user,
      atelier,
      isAuthenticated: !!user,
      isLoading,
      role: user?.role ?? null,
      // actions
      login,
      equipeLogin,
      logout,
      register,
      verifyOtp,
      resendOtp,
      activateCode,
      refreshAtelier,
      updateAtelierLocal,
      switchAtelier,
      can,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider')
  return ctx
}
