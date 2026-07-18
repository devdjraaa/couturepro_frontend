import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { parametresService } from '@/services/parametresService'
import { useAuth } from '@/contexts'
import { QUERY_STALE_TIME } from '@/constants/config'

const KEYS = {
  profil:  ['parametres', 'profil'],
  atelier: ['parametres', 'atelier'],
}

export function useProfil() {
  return useQuery({
    queryKey: KEYS.profil,
    queryFn: () => parametresService.getProfil(),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useUpdateProfil() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => parametresService.updateProfil(payload),
    onSuccess: (data) => queryClient.setQueryData(KEYS.profil, data),
  })
}

export function useAtelierParametres() {
  return useQuery({
    queryKey: KEYS.atelier,
    queryFn: () => parametresService.getAtelier(),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useUpdateAtelier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => parametresService.updateAtelier(payload),
    onSuccess: (data) => queryClient.setQueryData(KEYS.atelier, data),
  })
}

export function useCommunications() {
  return useQuery({
    queryKey: ['parametres', 'communications'],
    queryFn: () => parametresService.getCommunications(),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useUpdateCommunications() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => parametresService.updateCommunications(payload),
    onSuccess: (data) => queryClient.setQueryData(['parametres', 'communications'], data),
  })
}

export function useChangerMotDePasse() {
  return useMutation({
    mutationFn: (payload) => parametresService.changerMotDePasse(payload),
  })
}

export function usePreferences() {
  return useQuery({
    queryKey: ['parametres', 'preferences'],
    queryFn: () => parametresService.getPreferences(),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient()
  const { updateAtelierLocal } = useAuth()
  return useMutation({
    mutationFn: (payload) => parametresService.updatePreferences(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['parametres', 'preferences'], data)
      // Pt 74 : la devise et l'unité s'appliquent IMMÉDIATEMENT partout (le contexte
      // atelier alimente tous les affichages) — plus besoin de se reconnecter.
      const maj = {}
      if (data?.devise) maj.devise = data.devise
      if (data?.unite_mesure) maj.unite_mesure = data.unite_mesure
      if (Object.keys(maj).length) updateAtelierLocal(maj)
    },
  })
}

export function useFactureSettings() {
  return useQuery({
    queryKey: ['parametres', 'facture'],
    queryFn: () => parametresService.getFactureSettings(),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useUpdateFactureSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => parametresService.updateFactureSettings(payload),
    onSuccess: (data) => queryClient.setQueryData(['parametres', 'facture'], (old) => ({ ...old, ...data })),
  })
}

export function useUploadFactureLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file) => parametresService.uploadFactureLogo(file),
    onSuccess: (data) => queryClient.setQueryData(['parametres', 'facture'], (old) => ({ ...old, ...data })),
  })
}
