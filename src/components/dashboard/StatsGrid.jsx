import { Users, ClipboardList, TrendingUp, Clock } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { useCommandeStats } from '@/hooks/useCommandes'
import { formatCurrency } from '@/utils/formatCurrency'
import { Skeleton } from '@/components/ui'
import { cn } from '@/utils/cn'

const COLOR_MAP = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  accent:  'bg-accent/10  text-accent-600',
}

function StatCard({ icon: Icon, label, value, sub, color = 'primary', isLoading }) {
  return (
    <div className="bg-card border border-edge rounded-2xl p-4">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', COLOR_MAP[color])}>
        <Icon size={18} />
      </div>
      {isLoading ? (
        <Skeleton className="h-7 w-20 mb-1 rounded-lg" />
      ) : (
        <p className="text-xl font-bold font-display text-ink">{value}</p>
      )}
      <p className="text-xs text-dim mt-0.5">{label}</p>
      {sub && <p className="text-xs text-ghost mt-0.5">{sub}</p>}
    </div>
  )
}

export default function StatsGrid() {
  const { data: clients = [],  isLoading: loadingClients } = useClients()
  const { data: stats,         isLoading: loadingStats   } = useCommandeStats()

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={Users}
        label="Clients"
        value={clients.length}
        isLoading={loadingClients}
      />
      <StatCard
        icon={ClipboardList}
        label="En cours"
        value={stats?.en_cours ?? 0}
        sub={`${stats?.essai ?? 0} en essayage`}
        color="warning"
        isLoading={loadingStats}
      />
      <StatCard
        icon={TrendingUp}
        label="Encaissé"
        value={stats ? formatCurrency(stats.total_encaisse) : '—'}
        color="success"
        isLoading={loadingStats}
      />
      <StatCard
        icon={Clock}
        label="En attente"
        value={stats ? formatCurrency(stats.total_restant) : '—'}
        color="accent"
        isLoading={loadingStats}
      />
    </div>
  )
}
