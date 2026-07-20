import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { plansAdminService } from '@/services/admin/plansAdminService'
import { ADMIN_KEYS } from './adminQueryKeys'

/** S02A-28b : référentiel des clés configurables, servi par le serveur. */
export function useFonctionnalites() {
  return useQuery({
    queryKey: [...ADMIN_KEYS.plans, 'fonctionnalites'],
    queryFn: () => plansAdminService.getFonctionnalites(),
    staleTime: 30 * 60 * 1000,   // référentiel : ne bouge qu'à une migration
  })
}

export function useAdminPlans(params = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.plans, params],
    queryFn: () => plansAdminService.getAll(params),
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
