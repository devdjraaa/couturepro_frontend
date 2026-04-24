import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts'
import { Avatar } from '@/components/ui'
import { useNotificationsCount } from '@/hooks/useNotifications'

export default function Header({ title, showBack = false, onBack, rightAction, className }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: notifCount = 0 } = useNotificationsCount()

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-20 bg-card/80 backdrop-blur-sm border-b border-edge shrink-0',
        className,
      )}
      style={{ paddingTop: 'var(--safe-area-top)' }}
    >
      <div className="flex items-center gap-3 px-4 h-14">
        {/* Left */}
        {showBack ? (
          <button
            type="button"
            onClick={handleBack}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-subtle transition-colors shrink-0"
          >
            <ArrowLeft size={20} className="text-ink" />
          </button>
        ) : (
          <div className="w-9 shrink-0" />
        )}

        {/* Title */}
        <h1 className="flex-1 text-base font-semibold font-display text-ink truncate text-center">
          {title ?? 'Couture Pro'}
        </h1>

        {/* Right */}
        <div className="flex items-center gap-1 shrink-0">
          {rightAction}
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-subtle transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-dim" />
            {notifCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full" />
            )}
          </button>
          {user && (
            <button
              type="button"
              onClick={() => navigate('/profil')}
              className="rounded-full ml-1"
            >
              <Avatar name={user.nom} src={user.avatar} size="sm" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
