import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vetementService } from '@/services/vetementService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'

export function useVetements() {
  return useQuery({
    queryKey: QUERY_KEYS.vetements,
    queryFn: () => vetementService.getAll(),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useCreateVetement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => vetementService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vetements }),
  })
}

export function useUpdateVetement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => vetementService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vetements }),
  })
}

export function useDeleteVetement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => vetementService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vetements }),
  })
}
