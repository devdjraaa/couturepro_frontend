import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandeStats })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notificationsCount })
      const client = data?.client?.prenom
        ? `${data.client.prenom} ${data.client.nom}`
        : (data?.client?.nom ?? 'client')
      toast.success(`Commande pour ${client} créée avec succès.`)
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
    onSuccess: (data, { statut }) => {
      queryClient.setQueryData(QUERY_KEYS.commande(data.id), data)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandeStats })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notificationsCount })
      const messages = {
        livre:    'Commande marquée comme livrée.',
        annule:   'Commande annulée.',
        en_cours: 'Commande remise en cours.',
      }
      toast.success(messages[statut] ?? 'Statut mis à jour.')
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
