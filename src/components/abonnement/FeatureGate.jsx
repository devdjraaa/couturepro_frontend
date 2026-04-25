import { Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { usePlanFeature } from '@/hooks/usePlanFeature'

/**
 * Affiche `children` si la fonctionnalité `featureKey` est disponible dans le plan.
 * Sinon affiche un bloc "fonctionnalité non incluse" avec CTA upgrade.
 *
 * @prop {string}      featureKey   — clé du config (ex: 'photos_vip')
 * @prop {string}      featureName  — nom lisible affiché à l'utilisateur
 * @prop {ReactNode}   children
 * @prop {'card'|'inline'} variant  — rendu du message (default: 'card')
 */
export default function FeatureGate({ featureKey, featureName = 'Cette fonctionnalité', children, variant = 'card' }) {
  const navigate = useNavigate()
  const { available, isLoading } = usePlanFeature(featureKey)

  if (isLoading) return null
  if (available) return children

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-sm text-content-secondary py-3">
        <Lock size={14} className="shrink-0" />
        <span>{featureName} n'est pas inclus dans votre plan.</span>
        <button
          onClick={() => navigate('/parametres')}
          className="text-primary underline text-sm shrink-0"
        >
          Upgrader
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 py-10 px-6 text-center bg-surface border border-border rounded-2xl">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background border border-border">
        <Lock size={20} className="text-content-secondary" />
      </div>
      <div>
        <p className="font-semibold text-content mb-1">{featureName} non inclus</p>
        <p className="text-sm text-content-secondary">
          Cette fonctionnalité n'est pas disponible dans votre plan actuel. Passez à un plan supérieur pour y accéder.
        </p>
      </div>
      <Button variant="secondary" onClick={() => navigate('/parametres')}>
        Voir les plans
      </Button>
    </div>
  )
}
