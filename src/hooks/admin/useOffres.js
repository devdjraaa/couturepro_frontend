import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { offresAdminService } from '@/services/admin/offresAdminService'
import { ADMIN_KEYS } from './adminQueryKeys'

export function useAdminOffres(params = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.offres, params],
    queryFn: () => offresAdminService.getAll(params),
  })
}

export function useCreateOffre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => offresAdminService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.offres }),
  })
}

export function useUpdateOffre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => offresAdminService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.offres }),
  })
}

export function useDeleteOffre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => offresAdminService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.offres }),
  })
}
