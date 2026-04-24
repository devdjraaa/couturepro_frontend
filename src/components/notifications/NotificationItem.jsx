import { Bell, Package, CreditCard, Star, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatRelative } from '@/utils/formatDate'

const TYPE_CONFIG = {
  commande:   { icon: Package,     className: 'bg-primary/10 text-primary'    },
  paiement:   { icon: CreditCard,  className: 'bg-success/10 text-success'    },
  abonnement: { icon: Star,        className: 'bg-accent/10 text-accent-600'  },
  systeme:    { icon: AlertCircle, className: 'bg-warning/10 text-warning'    },
}

export default function NotificationItem({ notification, onPress }) {
  const config = TYPE_CONFIG[notification.type] ?? { icon: Bell, className: 'bg-subtle text-dim' }
  const Icon = config.icon

  return (
    <button
      type="button"
      onClick={() => onPress?.(notification)}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors',
        notification.lu ? 'hover:bg-subtle' : 'bg-primary/5 hover:bg-primary/10',
      )}
    >
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5', config.className)}>
        <Icon size={17} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm leading-snug', notification.lu ? 'text-dim' : 'text-ink font-medium')}>
          {notification.message}
        </p>
        <p className="text-xs text-ghost mt-0.5">{formatRelative(notification.created_at)}</p>
      </div>
      {!notification.lu && (
        <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />
      )}
    </button>
  )
}
