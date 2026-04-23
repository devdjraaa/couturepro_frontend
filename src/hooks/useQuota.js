import { useQuery } from '@tanstack/react-query'
import { quotaService } from '@/services/quotaService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'

export function useQuota() {
  return useQuery({
    queryKey: QUERY_KEYS.quota,
    queryFn: () => quotaService.getUsage(),
    staleTime: QUERY_STALE_TIME,
  })
}
