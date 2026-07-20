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

export function useModerationAvis() {
  return useQuery({ queryKey: ADMIN_KEYS.moderationAvis, queryFn: () => reglagesVitrineAdminService.getModerationAvis() })
}

export function useSetModerationAvis() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p) => reglagesVitrineAdminService.setModerationAvis(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.moderationAvis }),
  })
}

export function useCompteRebours() {
  return useQuery({ queryKey: ADMIN_KEYS.compteRebours, queryFn: () => reglagesVitrineAdminService.getCompteRebours() })
}

export function useSetCompteRebours() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p) => reglagesVitrineAdminService.setCompteRebours(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.compteRebours }),
  })
}
