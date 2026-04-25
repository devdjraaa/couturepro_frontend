import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ateliersAdminService } from '@/services/admin/ateliersAdminService'
import { ADMIN_KEYS } from './adminQueryKeys'

export function useAdminAteliers(params = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.ateliers, params],
    queryFn: () => ateliersAdminService.getAll(params),
  })
}

export function useAdminAtelier(id) {
  return useQuery({
    queryKey: ADMIN_KEYS.atelier(id),
    queryFn: () => ateliersAdminService.getById(id),
    enabled: !!id,
  })
}

export function useGelerAtelier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => ateliersAdminService.geler(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.ateliers })
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.atelier(id) })
    },
  })
}

export function useDegelerAtelier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => ateliersAdminService.degeler(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.ateliers })
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.atelier(id) })
    },
  })
}

export function useAdminAtelierFidelite(id) {
  return useQuery({
    queryKey: ADMIN_KEYS.atelierFid(id),
    queryFn: () => ateliersAdminService.getFidelite(id),
    enabled: !!id,
  })
}

export function useAjusterFidelite(atelierId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => ateliersAdminService.ajusterFidelite(atelierId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.atelierFid(atelierId) })
    },
  })
}
