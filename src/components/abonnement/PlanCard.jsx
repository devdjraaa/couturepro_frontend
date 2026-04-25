import { cn } from '@/utils/cn'
import { Button } from '@/components/ui'
import { formatCurrency } from '@/utils/formatCurrency'

export default function PlanCard({ plan, isCurrent, onUpgrade, isLoading }) {
  const dureeLabel = plan.duree_jours >= 365 ? '/ an' : '/ mois'

  return (
    <div className={cn(
      'bg-card border rounded-2xl p-4',
      isCurrent ? 'border-primary ring-1 ring-primary/20' : 'border-edge',
    )}>
      <div className="flex items-start justify-between mb-1">
        <p className="text-sm font-semibold text-ink">{plan.label}</p>
        {isCurrent && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold shrink-0">
            Actif
          </span>
        )}
      </div>
      <p className="text-xl font-bold text-ink">
        {formatCurrency(Number(plan.prix_xof))}
        <span className="text-xs font-normal text-dim ml-1">{dureeLabel}</span>
      </p>
      {plan.description_courte && (
        <p className="text-xs text-ghost mt-0.5 mb-3">{plan.description_courte}</p>
      )}
      {!isCurrent && (
        <Button variant="secondary" onClick={() => onUpgrade(plan.cle)} loading={isLoading} className="w-full mt-2">
          Choisir ce plan
        </Button>
      )}
    </div>
  )
}
