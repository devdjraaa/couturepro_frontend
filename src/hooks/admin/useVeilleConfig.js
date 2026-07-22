import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { veilleAdminService } from '@/services/admin/veilleAdminService'
import { ADMIN_KEYS } from './adminQueryKeys'

export function useVeilleConfig() {
  return useQuery({
    queryKey: ADMIN_KEYS.veilleConfig,
    queryFn: () => veilleAdminService.getConfig(),
  })
}

export function useUpdateVeilleConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => veilleAdminService.updateConfig(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.veilleConfig }),
  })
}
