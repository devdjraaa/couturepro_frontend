import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { abonnementService } from '@/services/abonnementService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'

export function useAbonnement() {
  return useQuery({
    queryKey: QUERY_KEYS.abonnement,
    queryFn: () => abonnementService.getCurrent(),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useAbonnementHistory() {
  return useQuery({
    queryKey: QUERY_KEYS.abonnementHistory,
    queryFn: () => abonnementService.getHistory(),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useUpgradeAbonnement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ niveau, periodicite }) => abonnementService.upgrade(niveau, periodicite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.abonnement })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
    },
  })
}

export function useActivateCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code) => abonnementService.activateCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.abonnement })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
    },
  })
}
