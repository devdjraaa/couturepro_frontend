import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Package, CreditCard, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNotifications, useMarquerLue, useMarquerToutesLues } from '@/hooks/useNotifications'
import { AppLayout } from '@/components/layout'
import { NotificationItem } from '@/components/notifications'
import { Skeleton, EmptyState } from '@/components/ui'
import { cn } from '@/utils/cn'

// ── Catégories (libellés résolus via i18n : notifications.cat.<key>) ────────────
const CATEGORIES = [
  { key: 'toutes'                          },
  { key: 'commande', icon: Package         },
  { key: 'paiement', icon: CreditCard      },
  { key: 'systeme',  icon: AlertCircle     },
]

function CategoryChips({ active, onChange }) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 py-2.5 border-b border-edge">
      {CATEGORIES.map(({ key }) => (
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
          {t(`notifications.cat.${key}`)}
        </button>
      ))}
    </div>
  )
}

// ── Groupement par jour (clés stables ; libellés via i18n) ──────────────────────
function groupByDay(notifications) {
  const now       = new Date()
  const todayStr  = now.toDateString()
  const hierStr   = new Date(now.getTime() - 86400000).toDateString()

  const groups = {}
  notifications.forEach(n => {
    const d  = new Date(n.created_at)
    const ds = d.toDateString()

    let key
    if (ds === todayStr)     key = 'aujourdhui'
    else if (ds === hierStr) key = 'hier'
    else {
      const diff = Math.floor((now - d) / 86400000)
      key = diff <= 7 ? 'semaine' : 'ancien'
    }

    if (!groups[key]) groups[key] = []
    groups[key].push(n)
  })

  const ORDER = ['aujourdhui', 'hier', 'semaine', 'ancien']
  return ORDER
    .filter(k => groups[k])
    .map(k => [k, groups[k]])
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
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
      title={t('notifications.titre')}
      showBack
      rightAction={
        nonLues > 0 ? (
          <button
            type="button"
            onClick={() => marquerToutesLues.mutate()}
            className="text-xs font-medium text-inverse/80 hover:text-inverse px-2 py-1"
          >
            {t('notifications.tout_lire')}
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
          title={t('notifications.vide.titre')}
          description={
            category === 'toutes'
              ? t('notifications.vide.description')
              : t('notifications.vide_categorie')
          }
          className="py-16"
        />
      ) : (
        <div className="pb-safe">
          {groups.map(([key, items]) => (
            <div key={key}>
              <p className="text-xs font-semibold text-ghost uppercase tracking-widest px-4 pt-4 pb-1">
                {t(`notifications.jour.${key}`)}
              </p>
              <div className="divide-y divide-edge">
                {items.map(n => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onPress={notif => {
                      if (!notif.is_read) marquerLue.mutate(notif.id)
                      if (notif.lien) navigate(notif.lien)
                    }}
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
