import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { annonceService } from '@/services/annonceService'

const CLE = ['annonces']

export function useAnnonces() {
  return useQuery({ queryKey: CLE, queryFn: () => annonceService.liste() })
}

function mutation(fn) {
  return function useM() {
    const qc = useQueryClient()
    return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: CLE }) })
  }
}

export const useCreerAnnonce    = mutation((p) => annonceService.creer(p))
export const useModifierAnnonce = mutation(({ id, ...p }) => annonceService.modifier(id, p))
export const useImageAnnonce    = mutation(({ id, fichier }) => annonceService.envoyerImage(id, fichier))
export const useRetirerImage    = mutation((id) => annonceService.retirerImage(id))
export const useSupprimerAnnonce = mutation((id) => annonceService.supprimer(id))
