import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { signalementsAdminService } from '@/services/admin/signalementsAdminService'
import { ateliersAdminService } from '@/services/admin/ateliersAdminService'
import { ADMIN_KEYS } from './adminQueryKeys'

export function useAdminSignalements(params = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.signalements, params],
    queryFn: () => signalementsAdminService.getAll(params),
  })
}

export function useTraiterSignalement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => signalementsAdminService.traiter(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.signalements }),
  })
}

/**
 * Applique la sanction correspondant au type de signalement, PUIS marque le
 * signalement traité — les deux vont ensemble : sanctionner sans clore laisserait
 * la ligne en attente, clore sans sanctionner ne fait rien.
 *
 * La sanction automatique au 3ᵉ signalement a été retirée (elle permettait de
 * geler la boutique d'un créateur avec trois requêtes anonymes) : c'est
 * désormais ici, et seulement ici, qu'une sanction s'applique.
 */
export function useSanctionnerSignalement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, type, cibleId }) => {
      if (type === 'profil') await ateliersAdminService.geler(cibleId)
      else if (type === 'avis') await signalementsAdminService.masquerAvis(cibleId)
      return signalementsAdminService.traiter(id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.signalements }),
  })
}
