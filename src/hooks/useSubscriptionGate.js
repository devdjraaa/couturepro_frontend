import { useAbonnement } from './useAbonnement'
import { useAuth } from '@/contexts'

const isSuspendu = (s) => s === 'expire' || s === 'gele'

export function useSubscriptionGate() {
  const { data: abonnement, isLoading } = useAbonnement()
  const { atelier } = useAuth()

  const statut = abonnement?.statut
  const atelierStatut = atelier?.statut
  // Bloque si l'ABONNEMENT expiré/suspendu OU si l'ATELIER a été gelé par l'admin.
  // (l'admin `geler` ne change que atelier.statut → il faut le prendre en compte, sinon
  //  le compte gelé garde l'accès — P2/P120.)
  const isBlocked = !isLoading && (isSuspendu(statut) || isSuspendu(atelierStatut))
  const reason = isBlocked
    ? ((atelierStatut === 'gele' || statut === 'gele') ? 'gele' : 'expire')
    : null

  return {
    isLoading,
    isBlocked,
    reason,
    daysLeft: abonnement?.jours_restants ?? null,
    statut: statut ?? null,
  }
}
