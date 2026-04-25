import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mesureService } from '@/services/mesureService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'

// Retourne le tableau complet des mesures d'un client (une par vetement_id)
export function useMesures(clientId) {
  return useQuery({
    queryKey: QUERY_KEYS.mesures(clientId),
    queryFn: () => mesureService.getByClient(clientId),
    enabled: !!clientId,
    staleTime: QUERY_STALE_TIME,
  })
}

// Crée ou met à jour la mesure d'un client pour un vêtement donné
// Usage: const save = useSaveMesures(clientId, vetementId)
//        save.mutate({ poitrine: 92, taille: 70, ... })
export function useSaveMesures(clientId, vetementId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (champs) => mesureService.save(clientId, vetementId, champs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mesures(clientId) })
    },
  })
}

export function useDeleteMesure(clientId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (mesureId) => mesureService.delete(mesureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mesures(clientId) })
    },
  })
}
