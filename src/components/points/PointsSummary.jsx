import { Star, Zap } from 'lucide-react'
import { usePoints } from '@/hooks/usePoints'
import { Skeleton } from '@/components/ui'

export default function PointsSummary() {
  const { data, isLoading } = usePoints()

  if (isLoading) return <Skeleton className="h-32 rounded-2xl" />

  const solde  = data?.solde_pts ?? 0
  const seuil  = data?.seuil_conversion ?? 10000
  const pct    = Math.min(100, Math.floor((solde / seuil) * 100))
  const bonus  = data?.bonus_actif ?? false
  const jours  = data?.bonus_jours_restants ?? 0

  return (
    <div className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={18} className="text-accent-600" fill="currentColor" />
          <p className="text-sm font-semibold text-ink">Points de fidélité</p>
        </div>
        {bonus && (
          <div className="flex items-center gap-1 text-xs text-success font-medium">
            <Zap size={12} />
            <span>{jours} jour{jours > 1 ? 's' : ''} bonus actif</span>
          </div>
        )}
      </div>

      <p className="text-3xl font-bold font-display text-ink">
        {solde.toLocaleString('fr-FR')} <span className="text-base font-normal text-dim">pts</span>
      </p>

      {/* Barre de progression */}
      <div>
        <div className="flex justify-between text-xs text-dim mb-1">
          <span>{pct}% vers la conversion</span>
          <span>{seuil.toLocaleString('fr-FR')} pts requis</span>
        </div>
        <div className="h-2 bg-edge rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-600 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-dim">
        À {seuil.toLocaleString('fr-FR')} pts → <span className="font-semibold text-ink">31 jours d'abonnement offerts</span>
      </p>
    </div>
  )
}
