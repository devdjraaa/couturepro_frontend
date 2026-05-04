import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commandeService } from '@/services/commandeService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'
import { enqueue } from '@/services/syncService'

const LIST_KEY = () => [...QUERY_KEYS.commandes, {}]

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
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.commandes })
      const prev = queryClient.getQueryData(LIST_KEY())
      const temp = {
        ...payload,
        id: `temp_${Date.now()}`,
        statut: 'en_cours',
        created_at: new Date().toISOString(),
        _optimistic: true,
      }
      queryClient.setQueryData(LIST_KEY(), old => [...(old ?? []), temp])
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) queryClient.setQueryData(LIST_KEY(), ctx.prev)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandeStats })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
    },
    onSettled: (_data, err, payload) => {
      if (err?.code === 'reseau') enqueue('commandes', 'create', `temp_${Date.now()}`, payload)
    },
  })
}

export function useUpdateCommande() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => commandeService.update(id, payload),
    onMutate: async ({ id, ...payload }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.commande(id) })
      const prev = queryClient.getQueryData(QUERY_KEYS.commande(id))
      queryClient.setQueryData(QUERY_KEYS.commande(id), old => old ? { ...old, ...payload } : old)
      return { prev, id }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) queryClient.setQueryData(QUERY_KEYS.commande(ctx.id), ctx.prev)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.commande(data.id), data)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandeStats })
    },
    onSettled: (_data, err, vars) => {
      if (err?.code === 'reseau') {
        const { id, ...payload } = vars
        enqueue('commandes', 'update', id, payload)
      }
    },
  })
}

export function useUpdateStatutCommande() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, statut }) => commandeService.updateStatut(id, statut),
    onMutate: async ({ id, statut }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.commande(id) })
      const prev = queryClient.getQueryData(QUERY_KEYS.commande(id))
      queryClient.setQueryData(QUERY_KEYS.commande(id), old => old ? { ...old, statut } : old)
      return { prev, id }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) queryClient.setQueryData(QUERY_KEYS.commande(ctx.id), ctx.prev)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.commande(data.id), data)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandeStats })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
    },
    onSettled: (_data, err, vars) => {
      if (err?.code === 'reseau') enqueue('commandes', 'update', vars.id, { statut: vars.statut })
    },
  })
}

export function useDeleteCommande() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => commandeService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.commandes })
      const prev = queryClient.getQueryData(LIST_KEY())
      queryClient.setQueryData(LIST_KEY(), old => (old ?? []).filter(c => c.id !== id))
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) queryClient.setQueryData(LIST_KEY(), ctx.prev)
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.commande(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandeStats })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
    },
    onSettled: (_data, err, id) => {
      if (err?.code === 'reseau') enqueue('commandes', 'delete', id)
    },
  })
}
