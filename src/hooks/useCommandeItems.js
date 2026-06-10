import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { commandeItemService } from '@/services/commandeItemService'
import { QUERY_KEYS } from './queryKeys'

export function useCommandeItems(commandeId) {
  return useQuery({
    queryKey: QUERY_KEYS.commandeItems(commandeId),
    queryFn:  () => commandeItemService.getAll(commandeId),
    enabled:  !!commandeId,
  })
}

export function useCreateCommandeItems(commandeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (items) => commandeItemService.bulkCreate(commandeId, items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.commandeItems(commandeId) })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.commande(commandeId) })
    },
  })
}

export function useUpdateCommandeItem(commandeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, ...payload }) => commandeItemService.update(commandeId, itemId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.commandeItems(commandeId) })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.commande(commandeId) })
    },
  })
}

export function useDeleteCommandeItem(commandeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId) => commandeItemService.delete(commandeId, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.commandeItems(commandeId) })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.commande(commandeId) })
      toast.success('Article supprimé.')
    },
  })
}
