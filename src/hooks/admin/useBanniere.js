import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { banniereAdminService } from '@/services/admin/banniereAdminService'
import { ADMIN_KEYS } from './adminQueryKeys'

export function useAdminBanniere() {
  return useQuery({
    queryKey: ADMIN_KEYS.banniere,
    queryFn: () => banniereAdminService.get(),
  })
}

export function useUpdateBanniere() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => banniereAdminService.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.banniere }),
  })
}
