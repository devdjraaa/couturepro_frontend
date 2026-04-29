import { useQuery } from '@tanstack/react-query'
import { caisseService } from '@/services/caisseService'
import { QUERY_KEYS } from './queryKeys'

export function useCaisseStats(mois) {
  return useQuery({
    queryKey: QUERY_KEYS.caisseStats(mois ?? null),
    queryFn:  () => caisseService.getStats(mois),
  })
}

export function useCaisseClients() {
  return useQuery({
    queryKey: QUERY_KEYS.caisseClients,
    queryFn:  caisseService.getClients,
  })
}
