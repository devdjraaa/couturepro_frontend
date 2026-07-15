import { useAbonnement } from './useAbonnement'
import { useAuth } from '@/contexts'

export function useSubscriptionGate() {
  const { data: abonnement, isLoading } = useAbonnement()
  const { atelier } = useAuth()

  const statut = abonnement?.statut
  const atelierStatut = atelier?.statut
  // P156 : un abonnement EXPIRÉ ne bloque plus l'app (repli mode gratuit : données visibles,
  // features premium verrouillées par FeatureGate, limites free côté serveur).
  // Le mur plein écran ne reste que pour un compte GELÉ par l'admin (P2/P120).
  const isGele   = statut === 'gele'   || atelierStatut === 'gele'
  const isExpire = statut === 'expire' || atelierStatut === 'expire'
  const isBlocked = !isLoading && isGele
  const reason = isBlocked ? 'gele' : null

  return {
    isLoading,
    isBlocked,
    isExpire,
    reason,
    daysLeft: abonnement?.jours_restants ?? null,
    statut: statut ?? null,
  }
}
