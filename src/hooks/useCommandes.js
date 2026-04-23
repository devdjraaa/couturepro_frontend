import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commandeService } from '@/services/commandeService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'

export function useCommandes(filters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.commandes, filters],
    queryFn: () => commandeService.getAll(filters),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useCommande(id) {
  return useQuery({
    queryKey: QUERY_KEYS.commande(id),
    queryFn: () => commandeService.getById(id),
    enabled: !!id,
    staleTime: QUERY_STALE_TIME,
  })
}

export function useCommandeStats() {
  return useQuery({
    queryKey: QUERY_KEYS.commandeStats,
    queryFn: () => commandeService.getStats(),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useCreateCommande() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => commandeService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandeStats })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
    },
  })
}

export function useUpdateCommande() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => commandeService.update(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.commande(data.id), data)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandeStats })
    },
  })
}

export function useUpdateStatutCommande() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, statut }) => commandeService.updateStatut(id, statut),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.commande(data.id), data)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandeStats })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
    },
  })
}

export function useDeleteCommande() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => commandeService.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.commande(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandeStats })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
    },
  })
}
