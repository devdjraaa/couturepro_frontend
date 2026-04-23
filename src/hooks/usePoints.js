import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pointsService } from '@/services/pointsService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'

export function usePoints() {
  return useQuery({
    queryKey: QUERY_KEYS.points,
    queryFn: () => pointsService.getSolde(),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useHistoriquePoints(params = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.pointsHistory, params],
    queryFn: () => pointsService.getHistorique(params),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useConvertirPoints() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (points) => pointsService.convertir(points),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.points })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pointsHistory })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.abonnement })
    },
  })
}
