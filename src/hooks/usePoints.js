import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pointsService } from '@/services/pointsService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'

// Retourne { solde_pts, seuil_conversion, bonus_actif, bonus_jours_restants, historique }
export function usePoints() {
  return useQuery({
    queryKey: QUERY_KEYS.points,
    queryFn: () => pointsService.getSolde(),
    staleTime: QUERY_STALE_TIME,
  })
}

// Convertit le solde complet en 31 jours de bonus (pas de paramètre points)
export function useConvertirPoints() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => pointsService.convertir(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.points })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.abonnement })
    },
  })
}
