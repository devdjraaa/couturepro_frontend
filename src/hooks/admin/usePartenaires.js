import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { partenairesAdminService } from '@/services/admin/partenairesAdminService'
import { ADMIN_KEYS } from './adminQueryKeys'

export function useCandidaturesPartenaires(params = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.partenaires, 'candidatures', params],
    queryFn: () => partenairesAdminService.candidatures(params),
  })
}

export function useStatutCandidature() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, statut }) => partenairesAdminService.changerStatutCandidature(id, statut),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.partenaires }),
  })
}

export function useAdminPartenaires(params = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.partenaires, 'liste', params],
    queryFn: () => partenairesAdminService.partenaires(params),
  })
}
