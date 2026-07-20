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

export function useJournalMaj() {
  return useQuery({ queryKey: ADMIN_KEYS.journalMaj, queryFn: () => reglagesVitrineAdminService.getJournalMaj() })
}

export function useSetJournalMaj() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (entrees) => reglagesVitrineAdminService.setJournalMaj(entrees),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.journalMaj }),
  })
}

/**
 * Quatre réglages qui n'avaient qu'une route d'écriture, donc aucun écran
 * possible. Les paliers de fidélité en particulier : la direction devait
 * recalibrer un programme inatteignable sans aucun moyen de le faire.
 */
export function usePaliersFidelite() {
  return useQuery({ queryKey: ADMIN_KEYS.paliersFidelite, queryFn: () => reglagesVitrineAdminService.getPaliersFidelite() })
}

export function useSetPaliersFidelite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p) => reglagesVitrineAdminService.setPaliersFidelite(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.paliersFidelite }),
  })
}

export function useCoordonnees() {
  return useQuery({ queryKey: ADMIN_KEYS.coordonnees, queryFn: () => reglagesVitrineAdminService.getCoordonnees() })
}

export function useSetCoordonnees() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p) => reglagesVitrineAdminService.setCoordonnees(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.coordonnees }),
  })
}

export function useMoyensPaiement() {
  return useQuery({ queryKey: ADMIN_KEYS.moyensPaiement, queryFn: () => reglagesVitrineAdminService.getMoyensPaiement() })
}

export function useSetMoyensPaiement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p) => reglagesVitrineAdminService.setMoyensPaiement(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.moyensPaiement }),
  })
}

export function useVasat() {
  return useQuery({ queryKey: ADMIN_KEYS.vasat, queryFn: () => reglagesVitrineAdminService.getVasat() })
}

export function useSetVasat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p) => reglagesVitrineAdminService.setVasat(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.vasat }),
  })
}
