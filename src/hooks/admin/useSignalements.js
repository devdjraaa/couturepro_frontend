import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { signalementsAdminService } from '@/services/admin/signalementsAdminService'
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
