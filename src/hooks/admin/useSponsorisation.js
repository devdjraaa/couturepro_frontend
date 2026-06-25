import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sponsorisationAdminService } from '@/services/admin/sponsorisationAdminService'
import { ADMIN_KEYS } from './adminQueryKeys'

export function useAdminSponsorisation() {
  return useQuery({
    queryKey: ADMIN_KEYS.sponsorisation,
    queryFn: () => sponsorisationAdminService.get(),
  })
}

export function useUpdateSponsorisation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => sponsorisationAdminService.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.sponsorisation }),
  })
}
