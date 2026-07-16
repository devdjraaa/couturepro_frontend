import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { pointsService } from '@/services/pointsService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'

// Retourne { solde_pts, seuil_conversion, bonus_actif, bonus_jours_restants, historique }
export function usePoints() {
  return useQuery({
    queryKey: QUERY_KEYS.points,
    queryFn: () => pointsService.getSolde(),
    staleTime: QUERY_STALE_TIME,
  })
}

// P39 : rend les points « visibles après une action ». Watcher global (monté dans AppLayout) :
// dès que le solde augmente (après une action qui rapporte des points, une fois synchronisée),
// on affiche un toast « +X pts ». Centralisé → couvre toutes les actions sans toucher chaque flux.
export function usePointsToast() {
  const { t } = useTranslation()
  const { data } = usePoints()
  const prev = useRef(null)

  useEffect(() => {
    const solde = data?.solde_pts
    if (solde == null) return
    // On n'annonce jamais au premier chargement : on mémorise juste la référence.
    if (prev.current != null && solde > prev.current) {
      const delta = solde - prev.current
      toast.success(t('points.gagnes', { n: delta }))
      showLocalNotif(t('points.gagnes_titre'), t('points.gagnes', { n: delta }))
    }
    prev.current = solde
  }, [data?.solde_pts]) // eslint-disable-line react-hooks/exhaustive-deps
}

// Convertit le solde complet en 31 jours de bonus (pas de paramètre points)
export function useConvertirPoints() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => pointsService.convertir(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.points })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.abonnement })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notificationsCount })
      toast.success('31 jours de bonus ajoutés à votre abonnement.')
    },
  })
}
