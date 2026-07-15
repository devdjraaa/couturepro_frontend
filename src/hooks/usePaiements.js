import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paiementService } from '@/services/paiementService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'

export function usePaiements(params = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.paiements, params],
    queryFn: () => paiementService.getAll(params),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useEnregistrerPaiement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ commandeId, ...payload }) => paiementService.enregistrer(commandeId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.paiements })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commande(variables.commandeId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandeStats })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.points })
    },
  })
}
