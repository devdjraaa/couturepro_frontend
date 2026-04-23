import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '@/services/notificationService'
import { QUERY_KEYS } from './queryKeys'

// Notifications se rafraîchissent plus souvent que le reste (2 min)
const NOTIF_STALE = 60 * 1000
const NOTIF_POLL  = 2 * 60 * 1000

export function useNotifications() {
  return useQuery({
    queryKey: QUERY_KEYS.notifications,
    queryFn: () => notificationService.getAll(),
    staleTime: NOTIF_STALE,
    refetchInterval: NOTIF_POLL,
  })
}

export function useNotificationsCount() {
  return useQuery({
    queryKey: QUERY_KEYS.notificationsCount,
    queryFn: () => notificationService.countNonLues(),
    staleTime: NOTIF_STALE,
    refetchInterval: NOTIF_POLL,
  })
}

export function useMarquerLue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => notificationService.marquerLue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notificationsCount })
    },
  })
}

export function useMarquerToutesLues() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationService.marquerToutesLues(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notificationsCount })
    },
  })
}
