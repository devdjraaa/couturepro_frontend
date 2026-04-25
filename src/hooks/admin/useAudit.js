import { useQuery } from '@tanstack/react-query'
import { auditAdminService } from '@/services/admin/auditAdminService'
import { ADMIN_KEYS } from './adminQueryKeys'

export function useAuditLogs(params = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.audit, params],
    queryFn: () => auditAdminService.getAll(params),
  })
}
