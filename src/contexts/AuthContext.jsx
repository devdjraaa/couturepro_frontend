import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '@/services/authService'
import { getToken } from '@/utils/storage'
import { setDemoMode } from '@/services/mockFlag'

// ── Permissions par rôle ──────────────────────────────────────────────────────
const ROLE_PERMISSIONS = {
  proprietaire: [
    'clients.view', 'clients.create', 'clients.edit', 'clients.delete',
    'commandes.view', 'commandes.create', 'commandes.edit', 'commandes.delete',
    'mesures.view', 'mesures.edit',
    'vetements.manage',
    'equipe.manage',
    'abonnement.manage',
    'parametres.manage',
    'points.convert',
    'notifications.view',
  ],
  assistant: [
    'clients.view', 'clients.create', 'clients.edit',
    'commandes.view', 'commandes.create', 'commandes.edit',
    'mesures.view', 'mesures.edit',
    'vetements.manage',
    'notifications.view',
  ],
  membre: [
    'clients.view',
    'commandes.view', 'commandes.create',
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

  // Restaurer la session au démarrage
  useEffect(() => {
    if (!getToken()) { setIsLoading(false); return }
    authService.getMe()
      .then(({ user, atelier }) => {
        setUser(user)
        setAtelier(atelier)
        setDemoMode(!!atelier?.is_demo)
      })
      .catch(() => { /* token invalide — clearAll déjà appelé par l'intercepteur */ })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (payload) => {
    const { user, atelier } = await authService.login(payload)
    setUser(user)
    setAtelier(atelier)
    setDemoMode(!!atelier?.is_demo)
  }, [])

  const equipeLogin = useCallback(async (payload) => {
    const { user } = await authService.equipeLogin(payload)
    setUser(user)
    setAtelier(null)
    setDemoMode(false)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
    setAtelier(null)
    setDemoMode(false)
  }, [])

  const register = useCallback((payload) => authService.register(payload), [])

  const verifyOtp = useCallback(async (payload) => {
    const { user, atelier } = await authService.verifyOtp(payload)
    setUser(user)
    setAtelier(atelier)
    setDemoMode(!!atelier?.is_demo)
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
