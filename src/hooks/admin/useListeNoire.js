import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listeNoireAdminService } from '@/services/admin/listeNoireAdminService'
import { ADMIN_KEYS } from './adminQueryKeys'

export function useListeNoire(params = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.listeNoire, params],
    queryFn: () => listeNoireAdminService.getAll(params),
  })
}

export function useAddListeNoire() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => listeNoireAdminService.add(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.listeNoire }),
  })
}

export function useRemoveListeNoire() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => listeNoireAdminService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.listeNoire }),
  })
}
