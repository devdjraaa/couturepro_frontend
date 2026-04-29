import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { archiveService } from '@/services/archiveService'
import { QUERY_KEYS } from './queryKeys'

export function useArchives() {
  return useQuery({
    queryKey: QUERY_KEYS.archives,
    queryFn:  archiveService.getAll,
  })
}

export function useArchiver(entityType, entityId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (note) => archiveService.archiver(entityType, entityId, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.archives })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.commandes })
    },
  })
}

export function useDesarchiver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ entityType, entityId }) => archiveService.desarchiver(entityType, entityId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.archives })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.commandes })
    },
  })
}
