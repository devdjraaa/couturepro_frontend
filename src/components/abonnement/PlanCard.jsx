import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui'
import { formatCurrency } from '@/utils/formatCurrency'
import { featuresFromConfig } from '@/utils/planFeatures'
import { useLibellesPlans } from '@/hooks/useLibellesPlans'
import i18n from '@/lang/i18n'

// Les lignes non incluses ne sont plus rendues barrées : `featuresFromConfig`
// n'émet que ce que le plan contient réellement.
function FeatureRow({ label }) {
  return (
    <li className="flex items-start gap-2 text-xs text-ink">
      <Check size={11} className="text-success shrink-0 mt-0.5" />
      <span>{label}</span>
    </li>
  )
}

export default function PlanCard({ plan, isCurrent, abonnementStatut, onUpgrade, isLoading }) {
  const { t } = useTranslation()

  const dureeLabel = plan.duree_jours >= 365 ? t('plans.par_an') : t('plans.par_mois')
  const isActive   = isCurrent && abonnementStatut === 'actif'
  const isEssai    = isCurrent && abonnementStatut === 'essai'
  // Le plan gratuit est attribué une seule fois, à la création du compte : on ne
  // peut pas le « choisir »/souscrire ensuite. Jamais de bouton d'action dessus.
  const isFree     = Number(plan.prix_xof) <= 0
  const canPay     = !isActive && !isFree

  const planName = t(`plans.${plan.cle}`, { defaultValue: plan.label })

  const libelles = useLibellesPlans()
  const features = featuresFromConfig(plan.config, t, undefined, {
    libelles,
    langue: (i18n.language || 'fr').startsWith('en') ? 'en' : 'fr',
  })

  // P46/SUG-23 : valoriser les cartes — plan mis en avant + équivalent mensuel & économie sur l'annuel.
  const estAnnuel = plan.duree_jours >= 365
  const equivMensuel = Number(plan.prix_mensuel_equivalent_xof) || 0
  const economieAnnuelle = estAnnuel && equivMensuel > 0
    ? Math.max(0, equivMensuel * 12 - Number(plan.prix_xof))
    : 0
  const desc = (plan.description_courte || '').toLowerCase()
  const misEnAvant = !isFree && (desc.includes('recommand') || desc.includes('premium'))

  return (
    <div className={cn(
      'bg-card border rounded-2xl p-4 flex flex-col gap-3 relative',
      isActive || isEssai ? 'border-primary ring-1 ring-primary/20'
        : misEnAvant ? 'border-primary/40 ring-1 ring-primary/10' : 'border-edge',
    )}>
      {/* Bandeau « mis en avant » */}
      {misEnAvant && !isActive && !isEssai && (
        <span className="absolute -top-2 left-4 text-2xs font-bold uppercase tracking-wide bg-primary text-inverse px-2 py-0.5 rounded-full">
          {desc.includes('premium') ? t('plans.badge_premium') : t('plans.badge_recommande')}
        </span>
      )}
      {/* En-tête */}
      <div>
        <div className="flex items-start justify-between mb-1">
          <p className="text-sm font-semibold text-ink">{planName}</p>
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
        <p className="text-xl font-bold text-ink">
          {formatCurrency(Number(plan.prix_xof))}
          <span className="text-xs font-normal text-dim ml-1">{dureeLabel}</span>
        </p>
        {/* Équivalent mensuel + économie (annuel) */}
        {estAnnuel && equivMensuel > 0 && (
          <p className="text-xs text-dim mt-0.5">
            {t('plans.equiv_mensuel', { montant: formatCurrency(equivMensuel) })}
            {economieAnnuelle > 0 && (
              <span className="text-success font-semibold ml-1">
                · {t('plans.economie', { montant: formatCurrency(economieAnnuelle) })}
              </span>
            )}
          </p>
        )}
        {plan.description_courte && (
          <p className="text-xs text-dim mt-0.5">{plan.description_courte}</p>
        )}
      </div>

      {/* Fonctionnalités — dérivées de la config du plan par la MÊME fonction que
          la page de tarifs publique. Cet écran tenait sa propre liste, écrite à
          la main et dans un autre vocabulaire : un même plan ne se lisait pas
          pareil ici et sur la vitrine, et un quota modifié en administration
          n'apparaissait pas forcément. Désormais le texte découle de la valeur. */}
      {features.length > 0 && (
        <ul className="space-y-1.5 border-t border-border pt-3">
          {features.map((f) => (
            <FeatureRow key={f.cle} label={f.texte} />
          ))}
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
