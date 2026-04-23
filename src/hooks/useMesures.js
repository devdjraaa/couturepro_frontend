import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mesureService } from '@/services/mesureService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'

export function useMesures(clientId) {
  return useQuery({
    queryKey: QUERY_KEYS.mesures(clientId),
    queryFn: () => mesureService.getByClient(clientId),
    enabled: !!clientId,
    staleTime: QUERY_STALE_TIME,
  })
}

export function useSaveMesures(clientId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => mesureService.save(clientId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.mesures(clientId), data)
    },
  })
}
