import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { galerieService } from '@/services/galerieService'
import { QUERY_KEYS } from './queryKeys'

export function useGalerie() {
  return useQuery({
    queryKey: QUERY_KEYS.galerie,
    queryFn:  galerieService.getAll,
  })
}

export function useGalerieQuota() {
  return useQuery({
    queryKey: QUERY_KEYS.galerieQuota,
    queryFn:  galerieService.getQuota,
  })
}

export function useUploadPhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ file, nom }) => galerieService.upload(file, nom),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.galerie })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.galerieQuota })
      toast.success('Photo ajoutée à la galerie.')
    },
    onError: (err) => {
      if (err?.code === 'non_autorise') {
        toast.error(err.plan_requis_label
          ? `Cette fonctionnalité nécessite le plan ${err.plan_requis_label}.`
          : 'Plan insuffisant pour cette fonctionnalité.')
      } else {
        toast.error('Erreur lors de l\'upload.')
      }
    },
  })
}

export function useDeletePhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => galerieService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.galerie })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.galerieQuota })
      toast.success('Photo supprimée.')
    },
  })
}
