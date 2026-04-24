import { Star, Gift } from 'lucide-react'
import { useAtelier } from '@/contexts'

export default function PointsSummary() {
  const { points, joursPoints } = useAtelier()
  const cadeaux = Math.floor(points / 100)

  return (
    <div className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Star size={18} className="text-accent-600" fill="currentColor" />
        <p className="text-sm font-semibold text-ink">Points de fidélité</p>
      </div>
      <p className="text-3xl font-bold font-display text-ink">{points ?? 0}</p>
      <p className="text-xs text-dim mt-1">
        Équivaut à{' '}
        <span className="font-semibold text-ink">{joursPoints ?? 0} jour{joursPoints > 1 ? 's' : ''}</span>{' '}
        offert{joursPoints > 1 ? 's' : ''} à vos clients
      </p>
      {cadeaux > 0 && (
        <div className="flex items-center gap-1.5 mt-3 text-xs text-accent-600 font-medium">
          <Gift size={13} />
          <span>
            Vous pouvez offrir {cadeaux} journée{cadeaux > 1 ? 's' : ''} gratuitement
          </span>
        </div>
      )}
    </div>
  )
}
