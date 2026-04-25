import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsAdminService } from '@/services/admin/transactionsAdminService'
import { ADMIN_KEYS } from './adminQueryKeys'

export function useAdminTransactions(params = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.transactions, params],
    queryFn: () => transactionsAdminService.getAll(params),
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => transactionsAdminService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.transactions }),
  })
}

export function useCancelTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => transactionsAdminService.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.transactions }),
  })
}
