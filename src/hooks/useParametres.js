import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { parametresService } from '@/services/parametresService'
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
  return useMutation({
    mutationFn: (payload) => parametresService.updatePreferences(payload),
    onSuccess: (data) => queryClient.setQueryData(['parametres', 'preferences'], data),
  })
}
