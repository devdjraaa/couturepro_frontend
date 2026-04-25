import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paiementsAdminService } from '@/services/admin/paiementsAdminService'
import { ADMIN_KEYS } from './adminQueryKeys'

export function useAdminPaiements(params = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.paiements, params],
    queryFn: () => paiementsAdminService.getAll(params),
  })
}

export function useValiderPaiement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => paiementsAdminService.valider(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.paiements }),
  })
}

export function useRembourserPaiement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => paiementsAdminService.rembourser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.paiements }),
  })
}
