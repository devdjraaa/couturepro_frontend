import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ateliersService } from '@/services/ateliersService'
import { QUERY_KEYS } from './queryKeys'

export function useMesAteliers() {
  return useQuery({
    queryKey: QUERY_KEYS.mesAteliers,
    queryFn: () => ateliersService.getMesAteliers(),
  })
}

export function useAtelierStats(atelierId) {
  return useQuery({
    queryKey: QUERY_KEYS.atelierStats(atelierId),
    queryFn: () => ateliersService.getStats(atelierId),
    enabled: !!atelierId,
  })
}

export function useCreateSousAtelier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => ateliersService.createSousAtelier(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.mesAteliers }),
  })
}
