import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts'
import { Spinner } from '@/components/ui'
import SubscriptionWall from './SubscriptionWall'

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const { pathname } = useLocation()

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-app">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <>
      <div key={pathname} className="gx-page-enter">
        <Outlet />
      </div>
      <SubscriptionWall />
    </>
  )
}
