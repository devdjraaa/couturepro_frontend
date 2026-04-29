import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNotifications, useMarquerLue, useMarquerToutesLues } from '@/hooks/useNotifications'
import { AppLayout } from '@/components/layout'
import { NotificationItem } from '@/components/notifications'
import { Skeleton, EmptyState } from '@/components/ui'

export default function NotificationsPage() {
  const { t } = useTranslation()
  const { data: notifications = [], isLoading } = useNotifications()
  const marquerLue = useMarquerLue()
  const marquerToutesLues = useMarquerToutesLues()

  const nonLues = notifications.filter(n => !n.lu)

  return (
    <AppLayout
      title={t('notifications.titre')}
      rightAction={
        nonLues.length > 0 ? (
          <button
            onClick={() => marquerToutesLues.mutate()}
            className="text-xs text-primary font-medium px-2 py-1"
          >
            {t('notifications.tout_marquer_lu')}
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
            title={t('notifications.vide.titre')}
            description={t('notifications.vide.description')}
          />
        ) : (
          notifications.map(n => (
            <NotificationItem
              key={n.id}
              notification={n}
              onPress={notif => { if (!notif.lu) marquerLue.mutate(notif.id) }}
            />
          ))
        )}
      </div>
    </AppLayout>
  )
}
