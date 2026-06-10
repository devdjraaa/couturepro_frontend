import { useState, useMemo } from 'react'
import { Bell, Package, CreditCard, AlertCircle } from 'lucide-react'
import { useNotifications, useMarquerLue, useMarquerToutesLues } from '@/hooks/useNotifications'
import { AppLayout } from '@/components/layout'
import { NotificationItem } from '@/components/notifications'
import { Skeleton, EmptyState } from '@/components/ui'
import { cn } from '@/utils/cn'

// ── Catégories ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'toutes',   label: 'Toutes'    },
  { key: 'commande', label: 'Commandes', icon: Package     },
  { key: 'paiement', label: 'Paiements', icon: CreditCard  },
  { key: 'systeme',  label: 'Rappels',   icon: AlertCircle },
]

function CategoryChips({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 py-2.5 border-b border-edge">
      {CATEGORIES.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            active === key
              ? 'bg-primary text-inverse'
              : 'bg-subtle text-ghost hover:text-ink',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ── Groupement par jour ────────────────────────────────────────────────────────
function groupByDay(notifications) {
  const now       = new Date()
  const todayStr  = now.toDateString()
  const hierStr   = new Date(now.getTime() - 86400000).toDateString()

  const groups = {}
  notifications.forEach(n => {
    const d  = new Date(n.created_at)
    const ds = d.toDateString()

    let label
    if (ds === todayStr)    label = "Aujourd'hui"
    else if (ds === hierStr) label = 'Hier'
    else {
      const diff = Math.floor((now - d) / 86400000)
      label = diff <= 7 ? 'Cette semaine' : 'Plus ancien'
    }

    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  })

  const ORDER = ["Aujourd'hui", 'Hier', 'Cette semaine', 'Plus ancien']
  return ORDER
    .filter(l => groups[l])
    .map(l => [l, groups[l]])
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [category, setCategory] = useState('toutes')

  const { data: notifications = [], isLoading } = useNotifications()
  const marquerLue       = useMarquerLue()
  const marquerToutesLues = useMarquerToutesLues()

  const filtered = useMemo(() => {
    if (category === 'toutes') return notifications
    return notifications.filter(n => n.type === category)
  }, [notifications, category])

  const groups  = useMemo(() => groupByDay(filtered), [filtered])
  const nonLues = notifications.filter(n => !n.lu).length

  return (
    <AppLayout
      title="Notifications"
      showBack
      rightAction={
        nonLues > 0 ? (
          <button
            type="button"
            onClick={() => marquerToutesLues.mutate()}
            className="text-xs font-medium text-inverse/80 hover:text-inverse px-2 py-1"
          >
            Tout lire
          </button>
        ) : null
      }
    >
      <CategoryChips active={category} onChange={setCategory} />

      {isLoading ? (
        <div className="p-4 space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Aucune notification"
          description={
            category === 'toutes'
              ? 'Vous êtes à jour !'
              : 'Aucune notification dans cette catégorie.'
          }
          className="py-16"
        />
      ) : (
        <div className="pb-safe">
          {groups.map(([label, items]) => (
            <div key={label}>
              <p className="text-xs font-semibold text-ghost uppercase tracking-widest px-4 pt-4 pb-1">
                {label}
              </p>
              <div className="divide-y divide-edge">
                {items.map(n => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onPress={notif => { if (!notif.lu) marquerLue.mutate(notif.id) }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
