import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { equipeService } from '@/services/equipeService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'

export function useEquipe() {
  return useQuery({
    queryKey: QUERY_KEYS.equipe,
    queryFn: () => equipeService.getAll(),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useInviterMembre() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => equipeService.invite(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.equipe }),
  })
}

export function useUpdateRoleMembre() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }) => equipeService.updateRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.equipe }),
  })
}

export function useRemoveMembre() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => equipeService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.equipe }),
  })
}
