import { useMutation, useQueryClient } from '@tanstack/react-query'
import { photoVipService } from '@/services/photoVipService'
import { QUERY_KEYS } from './queryKeys'

export function useUploadPhoto(clientId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file) => photoVipService.upload(clientId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.client(clientId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
    },
  })
}

export function useDeletePhoto(clientId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => photoVipService.delete(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.client(clientId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
    },
  })
}
