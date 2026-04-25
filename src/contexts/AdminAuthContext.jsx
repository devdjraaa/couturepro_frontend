import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { adminAuthService } from '@/services/admin/adminAuthService'
import { getAdminToken } from '@/utils/storage'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin,     setAdmin]     = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!getAdminToken()) { setIsLoading(false); return }
    adminAuthService.getMe()
      .then(setAdmin)
      .catch(() => { /* token invalide — intercepteur redirige déjà */ })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const adminData = await adminAuthService.login({ email, password })
    setAdmin(adminData)
  }, [])

  const logout = useCallback(async () => {
    await adminAuthService.logout()
    setAdmin(null)
  }, [])

  const hasPermission = useCallback((permission) => {
    if (!admin) return false
    if (admin.role === 'super_admin') return true
    return admin.permissions?.includes(permission) ?? false
  }, [admin])

  return (
    <AdminAuthContext.Provider value={{
      admin,
      isAuthenticated: !!admin,
      isLoading,
      isSuperAdmin: admin?.role === 'super_admin',
      login,
      logout,
      hasPermission,
    }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth doit être utilisé dans AdminAuthProvider')
  return ctx
}
