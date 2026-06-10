import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { commandeEcheanceService } from '@/services/commandeEcheanceService'
import { QUERY_KEYS } from './queryKeys'

export function useCommandeEcheances(commandeId) {
  return useQuery({
    queryKey: QUERY_KEYS.commandeEcheances(commandeId),
    queryFn:  () => commandeEcheanceService.getAll(commandeId),
    enabled:  !!commandeId,
  })
}

export function useCreateEcheance(commandeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => commandeEcheanceService.create(commandeId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.commandeEcheances(commandeId) })
      toast.success('Échéance ajoutée.')
    },
  })
}

export function useUpdateEcheance(commandeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => commandeEcheanceService.update(commandeId, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.commandeEcheances(commandeId) })
    },
  })
}

export function useDeleteEcheance(commandeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => commandeEcheanceService.delete(commandeId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.commandeEcheances(commandeId) })
      toast.success('Échéance supprimée.')
    },
  })
}
