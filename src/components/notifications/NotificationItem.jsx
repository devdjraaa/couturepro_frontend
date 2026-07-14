import { Bell, Package, CreditCard, Star, AlertCircle, Trash2, Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatRelative } from '@/utils/formatDate'

const TYPE_CONFIG = {
  commande:   { icon: Package,     className: 'bg-primary/10 text-primary'    },
  paiement:   { icon: CreditCard,  className: 'bg-success/10 text-success'    },
  abonnement: { icon: Star,        className: 'bg-accent/10 text-accent-600'  },
  systeme:    { icon: AlertCircle, className: 'bg-warning/10 text-warning'    },
}

export default function NotificationItem({ notification, onPress, onDelete, onMarkRead }) {
  const config = TYPE_CONFIG[notification.type] ?? { icon: Bell, className: 'bg-subtle text-dim' }
  const Icon = config.icon
  const lu = notification.is_read ?? notification.lu

  return (
    <div className={cn('w-full flex items-stretch', lu ? '' : 'bg-primary/5')}>
      <button
        type="button"
        onClick={() => onPress?.(notification)}
        className="flex-1 min-w-0 flex items-start gap-3 px-4 py-3.5 text-left hover:bg-subtle/60 transition-colors"
      >
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5', config.className)}>
          <Icon size={17} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm leading-snug', lu ? 'text-dim' : 'text-ink font-medium')}>
            {notification.titre}
          </p>
          {notification.contenu && (
            <p className="text-xs text-dim leading-snug mt-0.5 line-clamp-2">{notification.contenu}</p>
          )}
          <p className="text-xs text-ghost mt-0.5">{formatRelative(notification.created_at)}</p>
        </div>
        {!lu && <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />}
      </button>

      <div className="flex items-center shrink-0">
        {!lu && onMarkRead && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMarkRead(notification) }}
            className="px-2.5 h-full flex items-center text-ghost hover:text-success transition-colors"
            aria-label="Marquer comme lu"
            title="Marquer comme lu"
          >
            <Check size={17} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(notification) }}
            className="px-2.5 h-full flex items-center text-ghost hover:text-danger transition-colors"
            aria-label="Supprimer la notification"
            title="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
