import { useQuery } from '@tanstack/react-query'
import { analytiqueAdminService } from '@/services/admin/analytiqueAdminService'
import { ADMIN_KEYS } from './adminQueryKeys'

export function useAnalytique() {
  return useQuery({
    queryKey: ADMIN_KEYS.analytique,
    queryFn: () => analytiqueAdminService.get(),
    // Les tables de synthèse sont recalculées la nuit : inutile de reinterroger
    // à chaque retour sur l'écran.
    staleTime: 5 * 60 * 1000,
  })
}
