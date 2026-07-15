import { Q } from '@nozbe/watermelondb'
import { useWmQuery, useMutation, database } from '@/db/useWmQuery'
import { logAction } from '@/utils/historique'

function getAtelierId() {
  return localStorage.getItem('cp_atelier_local') || localStorage.getItem('cp_active_atelier') || ''
}

export function useMesures(clientId) {
  // La query WatermelonDB renvoie un tableau, mais les écrans partagés
  // (ClientDetailPage, CommandeDetailPage) attendent le MÊME contrat que le web :
  // un seul record de mesures (celui du client) exposant `.champs`, ou null.
  const { data, isLoading } = useWmQuery(
    () => database.get('mesures').query(
      Q.where('client_id', clientId ?? ''),
      Q.where('is_archived', false),
    ),
    [clientId],
  )
  // On privilégie la fiche « générale » du client (sans vêtement associé),
  // sinon le premier enregistrement disponible.
  const mesure = data.find(m => !m.vetement_id) ?? data[0] ?? null
  return { data: mesure, isLoading }
}

export function useSaveMesures(clientId) {
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
        // P72-73 : rattacher la mesure à l'atelier DU CLIENT (cohérence cross-atelier),
        // pas à l'atelier actif.
        const client = await database.get('clients').find(clientId).catch(() => null)
        await database.get('mesures').create(m => {
          m.client_id   = clientId ?? ''
          m.vetement_id = null
          m.champs_json = JSON.stringify(champs ?? {})
          m.is_archived = false
          m.atelier_id  = client?.atelier_id || getAtelierId()
        })
      }
    })
    logAction('mesure_sauvegardee', '')
  })
}
