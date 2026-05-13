import { Users, ClipboardList, TrendingUp, Clock, AlertTriangle, Timer } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useClients } from '@/hooks/useClients'
import { useCommandeStats } from '@/hooks/useCommandes'
import { formatCurrency } from '@/utils/formatCurrency'
import { Skeleton } from '@/components/ui'
import { cn } from '@/utils/cn'

const COLOR_MAP = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger:  'bg-danger/10  text-danger',
}

function StatCard({ icon: Icon, label, value, sub, color = 'primary', isLoading, onClick }) {
  return (
    <div
      className={cn('bg-card border border-edge rounded-2xl p-4', onClick && 'cursor-pointer active:opacity-70')}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', COLOR_MAP[color])}>
          <Icon size={16} />
        </div>
        <p className="text-xs text-dim font-medium leading-tight">{label}</p>
      </div>
      {isLoading ? (
        <Skeleton className="h-7 w-20 mb-1 rounded-lg" />
      ) : (
        <p className="text-2xl font-bold font-display text-ink leading-none">{value}</p>
      )}
      {sub && <p className="text-2xs text-ghost mt-1">{sub}</p>}
    </div>
  )
}

function AlertRow({ icon: Icon, label, count, variant, onClick }) {
  const isDanger = variant === 'danger'
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full border rounded-xl px-4 py-3',
        isDanger ? 'border-danger/30 bg-danger/5' : 'border-warning/30 bg-warning/5',
      )}
    >
      <Icon size={16} className={isDanger ? 'text-danger' : 'text-warning'} />
      <span className={cn('text-sm font-medium flex-1 text-left', isDanger ? 'text-danger' : 'text-warning')}>
        {label}
      </span>
      <span className={cn(
        'text-xs font-bold px-2 py-0.5 rounded-full',
        isDanger ? 'bg-danger/15 text-danger' : 'bg-warning/15 text-warning',
      )}>
        {count}
      </span>
    </button>
  )
}

export default function StatsGrid() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: clients = [],  isLoading: loadingClients } = useClients()
  const { data: stats,         isLoading: loadingStats   } = useCommandeStats()

  return (
    <div className="space-y-3">
      {/* Alertes urgentes */}
      {!loadingStats && (stats?.en_retard > 0 || stats?.dans_48h > 0) && (
        <div className="space-y-2">
          {stats.en_retard > 0 && (
            <AlertRow
              icon={AlertTriangle}
              label={`${stats.en_retard} commande${stats.en_retard > 1 ? 's' : ''} en retard`}
              count={stats.en_retard}
              variant="danger"
              onClick={() => navigate('/commandes?alerte=retard')}
            />
          )}
          {stats.dans_48h > 0 && (
            <AlertRow
              icon={Timer}
              label={`${stats.dans_48h} livraison${stats.dans_48h > 1 ? 's' : ''} dans 48h`}
              count={stats.dans_48h}
              variant="warning"
              onClick={() => navigate('/commandes?alerte=48h')}
            />
          )}
        </div>
      )}

      {/* Grille 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Users}
          label={t('dashboard.stat.clients')}
          sub={t('dashboard.stat.total_clients')}
          value={clients.length}
          isLoading={loadingClients}
          onClick={() => navigate('/clients')}
        />
        <StatCard
          icon={ClipboardList}
          label={t('dashboard.commandes_en_cours')}
          sub={t('dashboard.stat.commandes_actives')}
          value={stats?.en_cours ?? 0}
          color="warning"
          isLoading={loadingStats}
          onClick={() => navigate('/commandes')}
        />
        <StatCard
          icon={TrendingUp}
          label={t('dashboard.stat.encaisse')}
          sub={t('dashboard.revenus_mois')}
          value={stats ? formatCurrency(stats.total_encaisse) : '—'}
          color="success"
          isLoading={loadingStats}
        />
        <StatCard
          icon={Clock}
          label={t('dashboard.stat.en_attente')}
          sub={t('dashboard.stat.a_recouvrer')}
          value={stats ? formatCurrency(stats.total_restant) : '—'}
          color="danger"
          isLoading={loadingStats}
        />
      </div>
    </div>
  )
}
