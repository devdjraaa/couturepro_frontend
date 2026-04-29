import { Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui'
import { formatCurrency } from '@/utils/formatCurrency'

function FeatureRow({ label, value, count }) {
  const included = value && count !== 0
  return (
    <li className={cn('flex items-center gap-2 text-xs', included ? 'text-content' : 'text-content-secondary line-through')}>
      {included
        ? <Check size={11} className="text-success shrink-0" />
        : <X size={11} className="text-content-secondary shrink-0" />}
      <span>{count != null && included ? `${count === null ? '∞' : count} ` : ''}{label}</span>
    </li>
  )
}

export default function PlanCard({ plan, isCurrent, abonnementStatut, onUpgrade, isLoading }) {
  const { t } = useTranslation()

  const dureeLabel = plan.duree_jours >= 365 ? t('plans.par_an') : t('plans.par_mois')
  const isActive   = isCurrent && abonnementStatut === 'actif'
  const isEssai    = isCurrent && abonnementStatut === 'essai'
  const canPay     = !isActive

  const planName = t(`plans.${plan.cle}`, { defaultValue: plan.label })

  const cfg = typeof plan.config === 'string'
    ? JSON.parse(plan.config)
    : (plan.config ?? {})

  const illimite = t('plans.illimite')

  const clientsCount = cfg.max_clients_par_mois === null || cfg.max_clients_par_mois === -1
    ? illimite
    : cfg.max_clients_par_mois === 0 ? null : String(cfg.max_clients_par_mois)

  const membresCount = cfg.max_membres === null || cfg.max_membres === -1
    ? illimite
    : cfg.max_membres === 0 ? null : String(cfg.max_membres)

  return (
    <div className={cn(
      'bg-card border rounded-2xl p-4 flex flex-col gap-3',
      isActive || isEssai ? 'border-primary ring-1 ring-primary/20' : 'border-edge',
    )}>
      {/* En-tête */}
      <div>
        <div className="flex items-start justify-between mb-1">
          <p className="text-sm font-semibold text-content">{planName}</p>
          {isActive && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold shrink-0">
              {t('plans.actif')}
            </span>
          )}
          {isEssai && (
            <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full font-semibold shrink-0">
              {t('plans.essai')}
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
          <FeatureRow
            label={t('plans.clients_mois')}
            value={clientsCount !== null}
            count={clientsCount}
          />
          <FeatureRow
            label={t('plans.membres_equipe')}
            value={membresCount !== null}
            count={membresCount}
          />
          {cfg.photos_vip ? (
            <FeatureRow
              label={cfg.max_photos_vip_par_mois === null ? t('plans.photos_vip') : t('plans.photos_vip_mois')}
              value={true}
              count={cfg.max_photos_vip_par_mois === null ? illimite : cfg.max_photos_vip_par_mois}
            />
          ) : (
            <FeatureRow label={t('plans.photos_vip')} value={false} />
          )}
          {cfg.facture_whatsapp ? (
            <FeatureRow
              label={cfg.max_factures_par_mois === null ? t('plans.factures_wa') : t('plans.factures_wa_mois')}
              value={true}
              count={cfg.max_factures_par_mois === null ? illimite : cfg.max_factures_par_mois}
            />
          ) : (
            <FeatureRow label={t('plans.factures_wa')} value={false} />
          )}
          <FeatureRow label={t('plans.sauvegarde_auto')} value={!!cfg.sauvegarde_auto} />
          <FeatureRow label={t('plans.module_caisse')}   value={!!cfg.module_caisse}   />
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
          {isCurrent ? t('plans.renouveler') : t('plans.choisir')}
        </Button>
      )}
    </div>
  )
}
