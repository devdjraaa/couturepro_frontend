import { Lock } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui'
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate'

// Pages où le wall ne doit pas s'afficher (l'utilisateur doit pouvoir s'abonner)
const EXEMPT_PATHS = ['/parametres', '/paiement/retour']

export default function SubscriptionWall() {
  const navigate  = useNavigate()
  const { pathname } = useLocation()
  const { isBlocked, isLoading, reason } = useSubscriptionGate()

  if (isLoading || !isBlocked) return null
  if (EXEMPT_PATHS.some(p => pathname.startsWith(p))) return null

  const message =
    reason === 'gele'
      ? 'Votre compte a été suspendu. Contactez le support ou souscrivez un abonnement pour réactiver l\'accès.'
      : 'Votre période d\'essai ou abonnement a expiré. Souscrivez un plan pour continuer à utiliser l\'application.'

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 p-6 text-center bg-app/95 backdrop-blur-sm">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface border border-border">
        <Lock size={28} className="text-content-secondary" />
      </div>

      <div className="max-w-sm">
        <h2 className="text-xl font-bold text-content mb-2">Abonnement requis</h2>
        <p className="text-sm text-content-secondary">{message}</p>
      </div>

      <Button
        className="w-full max-w-xs"
        onClick={() => navigate('/parametres')}
      >
        Choisir un abonnement
      </Button>
    </div>
  )
}
