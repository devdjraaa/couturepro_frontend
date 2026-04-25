import { useAbonnement } from './useAbonnement'

export function useSubscriptionGate() {
  const { data: abonnement, isLoading } = useAbonnement()

  const statut = abonnement?.statut
  const isBlocked = !isLoading && !!abonnement && (statut === 'expire' || statut === 'gele')

  return {
    isLoading,
    isBlocked,
    reason: isBlocked ? statut : null,
    daysLeft: abonnement?.jours_restants ?? null,
    statut: statut ?? null,
  }
}
