import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminsService } from '@/services/admin/adminsService'
import { ADMIN_KEYS } from './adminQueryKeys'

export function useAdmins() {
  return useQuery({
    queryKey: ADMIN_KEYS.admins,
    queryFn: () => adminsService.getAll(),
  })
}

export function useCreateAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => adminsService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.admins }),
  })
}

export function useUpdateAdminPermissions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => adminsService.updatePermissions(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.admins }),
  })
}

export function useRevokeAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => adminsService.revoke(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.admins }),
  })
}
