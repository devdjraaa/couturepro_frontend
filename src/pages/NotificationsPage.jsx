import { Bell } from 'lucide-react'
import { useNotifications, useMarquerToutesLues } from '@/hooks/useNotifications'
import { AppLayout } from '@/components/layout'
import { NotificationItem } from '@/components/notifications'
import { Skeleton, EmptyState } from '@/components/ui'

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications()
  const marquerToutesLues = useMarquerToutesLues()

  const nonLues = notifications.filter(n => !n.lu)

  return (
    <AppLayout
      title="Notifications"
      rightAction={
        nonLues.length > 0 ? (
          <button
            onClick={() => marquerToutesLues.mutate()}
            className="text-xs text-primary font-medium px-2 py-1"
          >
            Tout lire
          </button>
        ) : null
      }
    >
      <div className="divide-y divide-edge">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Aucune notification"
            description="Vous êtes à jour !"
          />
        ) : (
          notifications.map(n => (
            <NotificationItem key={n.id} notification={n} />
          ))
        )}
      </div>
    </AppLayout>
  )
}
