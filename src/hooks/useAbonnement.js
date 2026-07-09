import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import i18n from '@/lang/i18n'
import { abonnementService } from '@/services/abonnementService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'

export function useAbonnement() {
  return useQuery({
    queryKey: QUERY_KEYS.abonnement,
    queryFn: () => abonnementService.getCurrent(),
    staleTime: 30_000,          // toujours frais après 30 s
    refetchInterval: 60_000,    // poll toutes les 60 s pour détecter l'expiration
  })
}

export function usePlans() {
  return useQuery({
    queryKey: ['abonnement', 'plans'],
    queryFn: () => abonnementService.getPlans(),
    staleTime: 30 * 60 * 1000,
  })
}

// Lance un paiement FedaPay pour un nouveau niveau d'abonnement
// payload: { niveau_cle: 'standard_mensuel', provider?: 'fedapay' }
// Retourne: { paiement_id, statut, checkout_url, expires_at, montant, devise }
// Cas plan gratuit : le backend active directement (statut 'completed', pas de
// checkout_url) → on rafraîchit et on confirme sans redirection FedaPay.
export function useInitierPaiementAbonnement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ niveau_cle, provider }) =>
      abonnementService.initierPaiement(niveau_cle, provider),
    onSuccess: (data) => {
      if (data?.statut === 'completed' || !data?.checkout_url) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.abonnement })
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notificationsCount })
        toast.success(i18n.t('parametres.abonnement.active_succes'))
      }
    },
  })
}

// Vérifie le statut d'un paiement en cours
export function useStatusPaiement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (paiementId) => abonnementService.statusPaiement(paiementId),
    onSuccess: (data) => {
      if (data.statut === 'valide') {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.abonnement })
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
      }
    },
  })
}

// Activation manuelle par code admin (TODO: endpoint backend à implémenter)
export function useActivateCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code) => abonnementService.activateCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.abonnement })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notificationsCount })
      toast.success('Abonnement activé avec succès.')
    },
  })
}
