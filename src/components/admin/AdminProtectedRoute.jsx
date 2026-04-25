import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '@/contexts'

export default function AdminProtectedRoute() {
  const { isAuthenticated, isLoading } = useAdminAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />
}
