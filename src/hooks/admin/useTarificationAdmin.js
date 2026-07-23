import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import i18n from '@/lang/i18n'
import { tarificationAdminService } from '@/services/admin/tarificationAdminService'

const CLE = ['admin', 'vitrine', 'tarification']

export function useTarificationAdmin() {
  return useQuery({ queryKey: CLE, queryFn: () => tarificationAdminService.get() })
}

export function useUpdateTarification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => tarificationAdminService.update(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLE })
      // Les libellés alimentent aussi l'application : on vide son cache.
      qc.invalidateQueries({ queryKey: ['plans', 'libelles'] })
      toast.success(i18n.t('admin.plans.libelles_enregistres'))
    },
    onError: (e) => toast.error(e?.message || i18n.t('erreurs.inconnu')),
  })
}
