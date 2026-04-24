import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui'
import { formatCurrency } from '@/utils/formatCurrency'

const PLANS = {
  gratuit: {
    label: 'Gratuit',
    prix: 0,
    features: ['10 clients max', '10 commandes / mois', 'Mesures de base', '1 utilisateur'],
  },
  pro: {
    label: 'Pro',
    prix: 9900,
    features: [
      'Clients illimités',
      'Commandes illimitées',
      "Équipe jusqu'à 5 membres",
      'Programme fidélité clients',
      'Support prioritaire',
    ],
  },
}

export default function PlanCard({ plan, isCurrent, onUpgrade, isLoading }) {
  const data = PLANS[plan] ?? PLANS.gratuit

  return (
    <div className={cn(
      'bg-card border rounded-2xl p-5',
      isCurrent ? 'border-primary shadow-md' : 'border-edge',
    )}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-ghost uppercase tracking-wider">{data.label}</p>
          <p className="text-2xl font-bold font-display text-ink mt-0.5">
            {data.prix === 0 ? 'Gratuit' : formatCurrency(data.prix)}
            {data.prix > 0 && <span className="text-sm font-normal text-dim"> / mois</span>}
          </p>
        </div>
        {isCurrent && (
          <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold shrink-0">
            Actuel
          </span>
        )}
      </div>
      <ul className="space-y-2 mb-5">
        {data.features.map(f => (
          <li key={f} className="flex items-center gap-2 text-sm text-dim">
            <Check size={14} className="text-success shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      {!isCurrent && (
        <Button onClick={onUpgrade} loading={isLoading} className="w-full">
          Passer au Pro
        </Button>
      )}
    </div>
  )
}
