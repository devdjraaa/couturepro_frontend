import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reglagesVitrineAdminService } from '@/services/admin/reglagesVitrineAdminService'
import { ADMIN_KEYS } from './adminQueryKeys'

export function useSplashThemes() {
  return useQuery({ queryKey: ADMIN_KEYS.splashThemes, queryFn: () => reglagesVitrineAdminService.getSplashThemes() })
}

export function useSetSplashThemes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (themes) => reglagesVitrineAdminService.setSplashThemes(themes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.splashThemes }),
  })
}

export function useIdentiteLegale() {
  return useQuery({ queryKey: ADMIN_KEYS.identiteLegale, queryFn: () => reglagesVitrineAdminService.getIdentiteLegale() })
}

export function useSetIdentiteLegale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p) => reglagesVitrineAdminService.setIdentiteLegale(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.identiteLegale }),
  })
}
