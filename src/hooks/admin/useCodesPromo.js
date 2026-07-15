import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { codesPromoAdminService } from '@/services/admin/codesPromoAdminService'

const KEY = ['admin', 'codes-promo']

export function useAdminCodesPromo(params = {}) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => codesPromoAdminService.getAll(params),
    staleTime: 30_000,
  })
}

export function useCreateCodePromo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => codesPromoAdminService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useToggleCodePromo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => codesPromoAdminService.toggle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
