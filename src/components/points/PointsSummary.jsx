import { Star, Zap } from 'lucide-react'
import { usePoints } from '@/hooks/usePoints'
import { Skeleton } from '@/components/ui'

// #37-40 — Niveaux de badge basés sur les points
const BADGE_TIERS = [
  { min: 0,      max: 999,    label: 'Bronze',   emoji: '🥉', color: 'text-amber-600',  bg: 'bg-amber-100'  },
  { min: 1000,   max: 4999,   label: 'Argent',   emoji: '🥈', color: 'text-slate-500',  bg: 'bg-slate-100'  },
  { min: 5000,   max: 14999,  label: 'Or',       emoji: '🥇', color: 'text-yellow-600', bg: 'bg-yellow-50'  },
  { min: 15000,  max: 49999,  label: 'Platine',  emoji: '💎', color: 'text-blue-500',   bg: 'bg-blue-50'    },
  { min: 50000,  max: Infinity,label: 'Diamant', emoji: '✨', color: 'text-purple-600', bg: 'bg-purple-50'  },
]

function getBadge(pts) {
  return BADGE_TIERS.find(t => pts >= t.min && pts <= t.max) ?? BADGE_TIERS[0]
}

function getNextBadge(pts) {
  const idx = BADGE_TIERS.findIndex(t => pts >= t.min && pts <= t.max)
  return idx < BADGE_TIERS.length - 1 ? BADGE_TIERS[idx + 1] : null
}

export default function PointsSummary() {
  const { data, isLoading } = usePoints()

  if (isLoading) return <Skeleton className="h-40 rounded-2xl" />

  const solde  = data?.solde_pts ?? 0
  const seuil  = data?.seuil_conversion ?? 10000
  const pct    = Math.min(100, Math.floor((solde / seuil) * 100))
  const bonus  = data?.bonus_actif ?? false
  const jours  = data?.bonus_jours_restants ?? 0
  const badge  = getBadge(solde)
  const next   = getNextBadge(solde)
  const pctBadge = next ? Math.min(100, Math.floor(((solde - badge.min) / (next.min - badge.min)) * 100)) : 100

  return (
    <div className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={18} className="text-accent-600" fill="currentColor" />
          <p className="text-sm font-semibold text-ink">Points de fidélité</p>
        </div>
        {/* #40 — Badge niveau auto-mis à jour */}
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.color}`}>
          {badge.emoji} {badge.label}
        </span>
      </div>

      <p className="text-3xl font-bold font-display text-ink">
        {solde.toLocaleString('fr-FR')} <span className="text-base font-normal text-dim">pts</span>
      </p>

      {/* Barre de progression vers niveau suivant */}
      {next && (
        <div>
          <div className="flex justify-between text-xs text-dim mb-1">
            <span>Vers {next.emoji} {next.label}</span>
            <span>{(next.min - solde).toLocaleString('fr-FR')} pts restants</span>
          </div>
          <div className="h-2 bg-edge rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-600 rounded-full transition-all duration-500"
              style={{ width: `${pctBadge}%` }}
            />
          </div>
        </div>
      )}

      {/* Barre vers conversion */}
      <div>
        <div className="flex justify-between text-xs text-dim mb-1">
          <span>{pct}% vers la conversion</span>
          <span>{seuil.toLocaleString('fr-FR')} pts requis</span>
        </div>
        <div className="h-1.5 bg-edge rounded-full overflow-hidden">
          <div className="h-full bg-primary/60 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {bonus && (
        <div className="flex items-center gap-1 text-xs text-success font-medium">
          <Zap size={12} />
          <span>{jours} jour{jours > 1 ? 's' : ''} de bonus actif</span>
        </div>
      )}

      <p className="text-xs text-dim">
        À {seuil.toLocaleString('fr-FR')} pts → <span className="font-semibold text-ink">31 jours d'abonnement offerts</span>
      </p>
    </div>
  )
}
