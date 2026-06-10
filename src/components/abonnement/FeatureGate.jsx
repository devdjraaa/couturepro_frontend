import { Lock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { usePlanFeature } from '@/hooks/usePlanFeature'

// #56-58 : FeatureGate enrichi — affiche plan requis + avantages depuis la réponse 403
export default function FeatureGate({
  featureKey,
  featureName = 'Cette fonctionnalité',
  children,
  variant = 'card',
  // Données optionnelles reçues d'une réponse 403 enrichie
  planRequis = null,
  planRequisLabel = null,
  avantages = [],
}) {
  const navigate = useNavigate()
  const { available, isLoading, planInfo } = usePlanFeature(featureKey)

  // Fusionner les données passées en prop avec ce que le hook connaît
  const label     = planRequisLabel ?? planInfo?.plan_requis_label ?? null
  const benefits  = avantages.length > 0 ? avantages : (planInfo?.avantages ?? [])

  if (isLoading) return null
  if (available) return children

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-sm text-ghost py-3">
        <Lock size={14} className="shrink-0" />
        <span>{featureName} — réservé au plan {label ?? 'supérieur'}.</span>
        <button
          onClick={() => navigate('/parametres', { state: { tab: 'abonnement' } })}
          className="text-primary underline text-sm shrink-0"
        >
          Upgrader
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 py-10 px-6 text-center bg-card border border-edge rounded-2xl">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-subtle border border-edge">
        <Lock size={20} className="text-ghost" />
      </div>
      <div>
        <p className="font-semibold text-ink mb-1">{featureName} non inclus</p>
        <p className="text-sm text-ghost">
          {label
            ? `Disponible à partir du plan ${label}.`
            : 'Cette fonctionnalité n\'est pas disponible dans votre plan actuel.'}
        </p>
        {benefits.length > 0 && (
          <ul className="mt-3 space-y-1 text-left">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-ghost">
                <ArrowRight size={12} className="text-primary mt-0.5 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button
        variant="primary"
        onClick={() => navigate('/parametres', { state: { tab: 'abonnement' } })}
      >
        Voir les plans
      </Button>
    </div>
  )
}
