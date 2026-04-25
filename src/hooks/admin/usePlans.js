import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { plansAdminService } from '@/services/admin/plansAdminService'
import { ADMIN_KEYS } from './adminQueryKeys'

export function useAdminPlans() {
  return useQuery({
    queryKey: ADMIN_KEYS.plans,
    queryFn: () => plansAdminService.getAll(),
  })
}

export function useCreatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => plansAdminService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.plans }),
  })
}

export function useUpdatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => plansAdminService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.plans }),
  })
}

export function useTogglePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => plansAdminService.toggle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.plans }),
  })
}
