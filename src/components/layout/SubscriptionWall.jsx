import { createPortal } from 'react-dom'
import { Lock, LifeBuoy } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui'
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate'

export default function SubscriptionWall() {
  const navigate  = useNavigate()
  const { pathname } = useLocation()
  const { isBlocked, isLoading, reason } = useSubscriptionGate()

  if (isLoading || !isBlocked) return null

  const isGele = reason === 'gele'

  // Page où l'utilisateur DOIT pouvoir aller pour régler sa situation :
  //  - gelé (suspension admin) → le support (tickets), surtout PAS l'abonnement (il ne paie pas pour un gel)
  //  - expiré → les réglages/abonnement (pour souscrire)
  const exemptPath = isGele ? '/support' : '/parametres'
  if (pathname.startsWith(exemptPath) || pathname.startsWith('/paiement/retour')) return null

  const Icon      = isGele ? LifeBuoy : Lock
  const title     = isGele ? 'Compte suspendu' : 'Abonnement requis'
  const message   = isGele
    ? 'Votre compte a été suspendu par l\'administration. Contactez le support pour en connaître la raison et rétablir votre accès.'
    : 'Votre période d\'essai ou votre abonnement a expiré. Souscrivez un plan pour continuer à utiliser l\'application.'
  const ctaLabel  = isGele ? 'Contacter le support' : 'Choisir un abonnement'
  const ctaTarget = isGele ? '/support' : '/parametres'

  // Portail vers <body> + z très élevé : couvre TOUT (FAB, barre du bas, modales)
  // en échappant à tout contexte d'empilement d'un parent transformé.
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5 p-6 text-center bg-app/95 backdrop-blur-sm">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-card border border-border">
        <Icon size={28} className="text-dim" />
      </div>

      <div className="max-w-sm">
        <h2 className="text-xl font-bold text-ink mb-2">{title}</h2>
        <p className="text-sm text-dim">{message}</p>
      </div>

      <Button className="w-full max-w-xs" onClick={() => navigate(ctaTarget)}>
        {ctaLabel}
      </Button>
    </div>,
    document.body,
  )
}
