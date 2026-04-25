import { Check, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui'
import { formatCurrency } from '@/utils/formatCurrency'

function limitLabel(value) {
  if (value === null || value === -1 || value === undefined) return 'Illimité'
  if (value === 0) return null // non inclus
  return String(value)
}

function FeatureRow({ label, value, isNum = false }) {
  if (isNum) {
    const txt = limitLabel(value)
    const included = txt !== null
    return (
      <li className={cn('flex items-center gap-2 text-xs', included ? 'text-content' : 'text-content-secondary line-through')}>
        {included
          ? <Check size={11} className="text-success shrink-0" />
          : <X size={11} className="text-content-secondary shrink-0" />}
        {included ? `${txt} ${label}` : label}
      </li>
    )
  }
  return (
    <li className={cn('flex items-center gap-2 text-xs', value ? 'text-content' : 'text-content-secondary')}>
      {value
        ? <Check size={11} className="text-success shrink-0" />
        : <X size={11} className="text-content-secondary shrink-0" />}
      <span className={value ? '' : 'line-through'}>{label}</span>
    </li>
  )
}

export default function PlanCard({ plan, isCurrent, abonnementStatut, onUpgrade, isLoading }) {
  const dureeLabel = plan.duree_jours >= 365 ? '/ an' : '/ mois'
  const isActive   = isCurrent && abonnementStatut === 'actif'
  const isEssai    = isCurrent && abonnementStatut === 'essai'
  const canPay     = !isActive

  const cfg = typeof plan.config === 'string'
    ? JSON.parse(plan.config)
    : (plan.config ?? {})

  return (
    <div className={cn(
      'bg-card border rounded-2xl p-4 flex flex-col gap-3',
      isActive || isEssai ? 'border-primary ring-1 ring-primary/20' : 'border-edge',
    )}>
      {/* En-tête */}
      <div>
        <div className="flex items-start justify-between mb-1">
          <p className="text-sm font-semibold text-content">{plan.label}</p>
          {isActive && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold shrink-0">
              Actif
            </span>
          )}
          {isEssai && (
            <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full font-semibold shrink-0">
              Essai
            </span>
          )}
        </div>
        <p className="text-xl font-bold text-content">
          {formatCurrency(Number(plan.prix_xof))}
          <span className="text-xs font-normal text-content-secondary ml-1">{dureeLabel}</span>
        </p>
        {plan.description_courte && (
          <p className="text-xs text-content-secondary mt-0.5">{plan.description_courte}</p>
        )}
      </div>

      {/* Fonctionnalités */}
      {Object.keys(cfg).length > 0 && (
        <ul className="space-y-1.5 border-t border-border pt-3">
          <FeatureRow label="clients / mois"   value={cfg.max_clients_par_mois}    isNum />
          <FeatureRow label="membres d'équipe" value={cfg.max_membres}             isNum />
          {cfg.photos_vip
            ? <FeatureRow label={`${limitLabel(cfg.max_photos_vip_par_mois)} photos VIP / mois`} value={true} />
            : <FeatureRow label="Photos VIP" value={false} />
          }
          <FeatureRow label="Factures WhatsApp" value={cfg.facture_whatsapp} />
          <FeatureRow label="Sauvegarde auto"   value={cfg.sauvegarde_auto} />
          <FeatureRow label="Module caisse"     value={cfg.module_caisse} />
        </ul>
      )}

      {/* Action */}
      {canPay && (
        <Button
          variant="secondary"
          onClick={() => onUpgrade(plan.cle)}
          loading={isLoading}
          className="w-full mt-auto"
        >
          {isCurrent ? 'Renouveler' : 'Choisir ce plan'}
        </Button>
      )}
    </div>
  )
}
