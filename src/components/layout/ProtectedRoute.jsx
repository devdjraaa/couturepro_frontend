import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts'
import { Spinner } from '@/components/ui'

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-app">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}
