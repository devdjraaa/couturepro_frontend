import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientService } from '@/services/clientService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'

export function useClients(filters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.clients, filters],
    queryFn: () => clientService.getAll(filters),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useClient(id) {
  return useQuery({
    queryKey: QUERY_KEYS.client(id),
    queryFn: () => clientService.getById(id),
    enabled: !!id,
    staleTime: QUERY_STALE_TIME,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => clientService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => clientService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.setQueryData(QUERY_KEYS.client(data.id), data)
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => clientService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.removeQueries({ queryKey: QUERY_KEYS.client(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
    },
  })
}

export function useArchiverClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => clientService.archiver(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.removeQueries({ queryKey: QUERY_KEYS.client(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
    },
  })
}

export function useToggleVip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => clientService.toggleVip(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.setQueryData(QUERY_KEYS.client(data.id), data)
    },
  })
}
