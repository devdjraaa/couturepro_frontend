import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Package, CreditCard, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNotifications, useMarquerLue, useMarquerToutesLues, useSupprimerNotif, useToutSupprimer, reconcileNotifications } from '@/hooks/useNotifications'
import { AppLayout } from '@/components/layout'
import { NotificationItem } from '@/components/notifications'
import { Skeleton, EmptyState } from '@/components/ui'
import { cn } from '@/utils/cn'
import { formatRelative } from '@/utils/formatDate'

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
  const [selected, setSelected] = useState(null)   // notif ouverte en popup (lecture complète)

  const { data: notifications = [], isLoading } = useNotifications()
  const marquerLue       = useMarquerLue()
  const marquerToutesLues = useMarquerToutesLues()
  const supprimerNotif   = useSupprimerNotif()
  const toutSupprimer    = useToutSupprimer()

  // Au chargement : purge les notifications orphelines (absentes du serveur).
  useEffect(() => { reconcileNotifications() }, [])

  const filtered = useMemo(() => {
    if (category === 'toutes') return notifications
    return notifications.filter(n => n.type === category)
  }, [notifications, category])

  const groups  = useMemo(() => groupByDay(filtered), [filtered])
  const nonLues = notifications.filter(n => !(n.is_read ?? n.lu)).length

  const confirmerToutEffacer = () => {
    if (notifications.length === 0) return
    if (window.confirm(t('notifications.confirm_tout_effacer'))) toutSupprimer.mutate()
  }
  const confirmerSuppr = (notif) => {
    if (window.confirm(t('notifications.confirm_supprimer'))) supprimerNotif.mutate(notif.id)
  }

  return (
    <AppLayout
      title={t('notifications.titre')}
      showBack
    >
      <CategoryChips active={category} onChange={setCategory} />

      {/* Actions groupées — dans la page (plus dans le header, pour ne pas l'encombrer). */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-end gap-4 px-4 pt-2 pb-1">
          {nonLues > 0 && (
            <button
              type="button"
              onClick={() => marquerToutesLues.mutate()}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {t('notifications.tout_lire')}
            </button>
          )}
          <button
            type="button"
            onClick={confirmerToutEffacer}
            className="text-xs font-semibold text-danger hover:underline"
          >
            {t('notifications.tout_effacer')}
          </button>
        </div>
      )}

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
                      setSelected(notif)          // ouvre le popup pour lire tout le contenu
                    }}
                    onMarkRead={notif => marquerLue.mutate(notif.id)}
                    onDelete={confirmerSuppr}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popup lecture complète (utile pour les longs messages de l'admin) */}
      {selected && (
        <div
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md bg-card rounded-2xl shadow-xl p-5 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-ink font-display leading-snug">{selected.titre}</h3>
            <p className="text-xs text-ghost mt-0.5 mb-3">{formatRelative(selected.created_at)}</p>
            {selected.contenu && (
              <div className="text-sm text-dim whitespace-pre-line overflow-y-auto flex-1">{selected.contenu}</div>
            )}
            <div className="flex gap-2 mt-4">
              {selected.lien && (
                <button
                  type="button"
                  onClick={() => { const l = selected.lien; setSelected(null); navigate(l) }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-600 transition"
                >
                  {t('notifications.ouvrir')}
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className={cn('px-4 py-2.5 rounded-xl bg-subtle text-ink font-semibold text-sm hover:bg-edge transition', selected.lien ? '' : 'flex-1')}
              >
                {t('commun.fermer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
