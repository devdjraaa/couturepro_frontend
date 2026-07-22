import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { veilleAdminService } from '@/services/admin/veilleAdminService'
import { ADMIN_KEYS } from './adminQueryKeys'

// `enabled` laisse l'appelant décider du moment : la page de veille sert
// d'abord à lire les résultats, et la configuration n'est demandée qu'à
// l'ouverture de la fenêtre de réglage.
export function useVeilleConfig({ enabled = true } = {}) {
  return useQuery({
    queryKey: ADMIN_KEYS.veilleConfig,
    queryFn: () => veilleAdminService.getConfig(),
    enabled,
  })
}

export function useUpdateVeilleConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => veilleAdminService.updateConfig(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.veilleConfig }),
  })
}
