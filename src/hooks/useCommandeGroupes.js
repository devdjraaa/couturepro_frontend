import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { commandeGroupeService } from '@/services/commandeGroupeService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'

export function useCommandeGroupes() {
  return useQuery({
    queryKey: QUERY_KEYS.commandeGroupes,
    queryFn: () => commandeGroupeService.getAll(),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useCommandeGroupe(id) {
  return useQuery({
    queryKey: QUERY_KEYS.commandeGroupe(id),
    queryFn: () => commandeGroupeService.getById(id),
    enabled: !!id,
    staleTime: QUERY_STALE_TIME,
  })
}

export function useCreateCommandeGroupe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => commandeGroupeService.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandeGroupes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandeStats })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notificationsCount })
      toast.success(`Commande groupée pour ${data?.client_nom ?? 'le client'} créée avec succès.`)
    },
  })
}
