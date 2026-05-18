import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '@/services/notificationService'
import { useNetwork } from '@/hooks/useNetwork'
import { QUERY_KEYS } from './queryKeys'

const NOTIF_STALE = 60 * 1000
const NOTIF_POLL  = 2 * 60 * 1000

export function useNotifications() {
  const { isOnline } = useNetwork()
  return useQuery({
    queryKey: QUERY_KEYS.notifications,
    queryFn: () => notificationService.getAll(),
    staleTime: NOTIF_STALE,
    refetchInterval: isOnline ? NOTIF_POLL : false,
  })
}

export function useNotificationsCount() {
  const { isOnline } = useNetwork()
  return useQuery({
    queryKey: QUERY_KEYS.notificationsCount,
    queryFn: () => notificationService.countNonLues(),
    staleTime: NOTIF_STALE,
    refetchInterval: isOnline ? NOTIF_POLL : false,
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
