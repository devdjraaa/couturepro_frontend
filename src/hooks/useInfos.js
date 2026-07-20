import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { infosService } from '@/services/infosService'
import { QUERY_KEYS } from './queryKeys'

// CLI-2 — les infos changent bien moins souvent que les notifications d'atelier
// (quelques messages par semaine contre plusieurs par jour) : les interroger au
// même rythme serait du trafic pour rien.
const INFOS_STALE = 5 * 60 * 1000
const INFOS_POLL  = 10 * 60 * 1000

export function useInfos() {
  return useQuery({
    queryKey: QUERY_KEYS.infos,
    queryFn: () => infosService.getAll(),
    staleTime: INFOS_STALE,
    refetchInterval: INFOS_POLL,
  })
}

export function useInfosCount() {
  return useQuery({
    queryKey: QUERY_KEYS.infosCount,
    queryFn: () => infosService.countNonLues(),
    staleTime: INFOS_STALE,
    refetchInterval: INFOS_POLL,
  })
}

export function useMarquerInfoLue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => infosService.marquerLue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.infos })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.infosCount })
    },
  })
}

export function useMarquerToutesInfosLues() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => infosService.marquerToutLu(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.infos })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.infosCount })
    },
  })
}
