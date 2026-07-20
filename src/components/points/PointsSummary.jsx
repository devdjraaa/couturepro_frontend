import { Star, Zap, Medal } from 'lucide-react'
import { usePoints } from '@/hooks/usePoints'
import { Skeleton } from '@/components/ui'

/**
 * ⚠️ Une échelle de paliers était CODÉE ICI (Argent à 1 000 pts) alors que le
 * serveur en envoie une autre (Argent à 5 000, éditable en admin). Les deux
 * s'affichaient sur le même écran : « 623 pts restants » d'un côté, « 4 623 »
 * de l'autre, pour le même objectif. Et la copie locale n'aurait jamais suivi
 * un recalibrage décidé par la direction.
 *
 * L'échelle vient désormais du serveur (`paliers.echelle`). Sans elle, on
 * n'affiche pas de palier plutôt que d'en inventer un.
 */
const TONS = [
  { color: 'text-amber-700',  bg: 'bg-amber-100'  },
  { color: 'text-slate-600',  bg: 'bg-slate-100'  },
  { color: 'text-yellow-700', bg: 'bg-yellow-50'  },
  { color: 'text-blue-600',   bg: 'bg-blue-50'    },
  { color: 'text-purple-600', bg: 'bg-purple-50'  },
]

export default function PointsSummary() {
  const { data, isLoading } = usePoints()

  if (isLoading) return <Skeleton className="h-40 rounded-2xl" />

  const solde  = data?.solde_pts ?? 0
  const seuil  = data?.seuil_conversion ?? 10000
  const pct    = Math.min(100, Math.floor((solde / seuil) * 100))
  const bonus  = data?.bonus_actif ?? false
  const jours  = data?.bonus_jours_restants ?? 0
  // Paliers servis par l'API (présents quand la fidélité avancée est activée).
  const paliers  = data?.paliers ?? null
  const echelle  = paliers?.echelle ?? []
  const badge    = paliers?.palier_actuel ?? null
  const next     = paliers?.palier_suivant ?? null
  const indexBadge = badge ? Math.max(0, echelle.findIndex((p) => p.cle === badge.cle)) : 0
  const ton      = TONS[indexBadge % TONS.length]
  // La progression se mesure sur le CUMUL gagné, pas sur le solde : convertir
  // ses points ne doit pas faire reculer d'un palier.
  const cumul    = paliers?.cumul_pts ?? solde
  const pctBadge = next && badge
    ? Math.min(100, Math.floor(((cumul - badge.seuil) / Math.max(1, next.seuil - badge.seuil)) * 100))
    : 100

  return (
    <div className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={18} className="text-accent-600" fill="currentColor" />
          <p className="text-sm font-semibold text-ink">Points de fidélité</p>
        </div>
        {/* #40 — Badge niveau auto-mis à jour */}
        {badge && (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${ton.bg} ${ton.color}`}>
            <Medal size={12} /> {badge.nom}
          </span>
        )}
      </div>

      <p className="text-3xl font-bold font-display text-ink">
        {solde.toLocaleString('fr-FR')} <span className="text-base font-normal text-dim">pts</span>
      </p>

      {/* Barre de progression vers niveau suivant */}
      {next && (
        <div>
          <div className="flex justify-between text-xs text-dim mb-1">
            <span className="inline-flex items-center gap-1"><Medal size={11} /> Vers {next.nom}</span>
            <span>{(paliers?.restant_pts ?? 0).toLocaleString('fr-FR')} pts restants</span>
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
