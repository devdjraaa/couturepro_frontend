<<<<<<< HEAD
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mesureService } from '@/services/mesureService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'
=======
import { Q } from '@nozbe/watermelondb'
import { useWmQuery, useMutation, database } from '@/db/useWmQuery'
import { logAction } from '@/utils/historique'

function getAtelierId() {
  return localStorage.getItem('cp_active_atelier') || ''
}
>>>>>>> d0b5c7e (fix(historique): alimenter l'historique local (SUG-20 — logAction n'était jamais appelé))

export function useMesures(clientId) {
  return useQuery({
    queryKey: QUERY_KEYS.mesures(clientId),
    queryFn: () => mesureService.getByClient(clientId),
    enabled: !!clientId,
    staleTime: QUERY_STALE_TIME,
  })
}

export function useSaveMesures(clientId) {
<<<<<<< HEAD
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (champs) => mesureService.save(clientId, champs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mesures(clientId) })
    },
=======
  // Même contrat que le web : on reçoit directement l'objet `champs`
  // (ex: { tour_poitrine: 97, ... }), pas un wrapper { vetement_id, champs }.
  return useMutation(async (champs) => {
    await database.write(async () => {
      const existing = await database.get('mesures').query(
        Q.where('client_id', clientId ?? ''),
      ).fetch()

      // Fiche « générale » du client (sans vêtement associé) : on la met à jour
      // qu'elle ait vetement_id null (venu du serveur) ou '' (créée en local).
      const general = existing.find(m => !m.vetement_id)

      if (general) {
        await general.update(m => {
          m.champs_json = JSON.stringify(champs ?? {})
        })
      } else {
        await database.get('mesures').create(m => {
          m.client_id   = clientId ?? ''
          m.vetement_id = null
          m.champs_json = JSON.stringify(champs ?? {})
          m.is_archived = false
          m.atelier_id  = getAtelierId()
        })
      }
    })
    logAction('mesure_sauvegardee', '')
>>>>>>> d0b5c7e (fix(historique): alimenter l'historique local (SUG-20 — logAction n'était jamais appelé))
  })
}
