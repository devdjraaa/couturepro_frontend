import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientService } from '@/services/clientService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'
import { enqueue } from '@/services/syncService'

const LIST_KEY = () => [...QUERY_KEYS.clients, {}]

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
    mutationFn: (payload) => {
      const cached = queryClient.getQueryData(LIST_KEY()) ?? []
      const nom    = payload.nom?.toLowerCase().trim() ?? ''
      const prenom = payload.prenom?.toLowerCase().trim() ?? ''
      const exists = cached.some(c =>
        c.nom.toLowerCase().trim() === nom &&
        (c.prenom?.toLowerCase().trim() ?? '') === prenom,
      )
      if (exists) {
        const err = new Error(`Un client nommé "${payload.prenom ? payload.prenom + ' ' : ''}${payload.nom}" existe déjà.`)
        err.code = 'doublon'
        throw err
      }
      return clientService.create(payload)
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.clients })
      const prev = queryClient.getQueryData(LIST_KEY())
      const tempClient = { ...payload, id: `temp_${Date.now()}`, _optimistic: true }
      queryClient.setQueryData(LIST_KEY(), old => [...(old ?? []), tempClient])
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) queryClient.setQueryData(LIST_KEY(), ctx.prev)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
    },
    // Si hors ligne (pas de réponse serveur), on met en queue
    onSettled: (_data, err, payload) => {
      if (err?.code === 'reseau') enqueue('clients', 'create', `temp_${Date.now()}`, payload)
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => clientService.update(id, payload),
    onMutate: async ({ id, ...payload }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.client(id) })
      const prev = queryClient.getQueryData(QUERY_KEYS.client(id))
      queryClient.setQueryData(QUERY_KEYS.client(id), old => old ? { ...old, ...payload } : old)
      return { prev, id }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) queryClient.setQueryData(QUERY_KEYS.client(ctx.id), ctx.prev)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.setQueryData(QUERY_KEYS.client(data.id), data)
    },
    onSettled: (_data, err, vars) => {
      if (err?.code === 'reseau') {
        const { id, ...payload } = vars
        enqueue('clients', 'update', id, payload)
      }
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => clientService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.clients })
      const prev = queryClient.getQueryData(LIST_KEY())
      queryClient.setQueryData(LIST_KEY(), old => (old ?? []).filter(c => c.id !== id))
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) queryClient.setQueryData(LIST_KEY(), ctx.prev)
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.removeQueries({ queryKey: QUERY_KEYS.client(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
    },
    onSettled: (_data, err, id) => {
      if (err?.code === 'reseau') enqueue('clients', 'delete', id)
    },
  })
}

export function useArchiverClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => clientService.archiver(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.clients })
      const prev = queryClient.getQueryData(LIST_KEY())
      queryClient.setQueryData(LIST_KEY(), old => (old ?? []).filter(c => c.id !== id))
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) queryClient.setQueryData(LIST_KEY(), ctx.prev)
    },
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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.client(id) })
      const prev = queryClient.getQueryData(QUERY_KEYS.client(id))
      queryClient.setQueryData(QUERY_KEYS.client(id), old =>
        old ? { ...old, type_profil: old.type_profil === 'vip' ? 'regulier' : 'vip' } : old,
      )
      return { prev, id }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) queryClient.setQueryData(QUERY_KEYS.client(ctx.id), ctx.prev)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.setQueryData(QUERY_KEYS.client(data.id), data)
    },
  })
}
