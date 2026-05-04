import { Q } from '@nozbe/watermelondb'
import { useWmQuery, useMutation, database } from '@/db/useWmQuery'

function getAtelierId() {
  return localStorage.getItem('cp_active_atelier') || ''
}

export function useMesures(clientId) {
  return useWmQuery(
    () => database.get('mesures').query(
      Q.where('client_id', clientId ?? ''),
      Q.where('is_archived', false),
    ),
    [clientId],
  )
}

export function useSaveMesures(clientId) {
  return useMutation(async ({ vetement_id, champs }) => {
    await database.write(async () => {
      const existing = await database.get('mesures').query(
        Q.where('client_id',   clientId ?? ''),
        Q.where('vetement_id', vetement_id ?? ''),
      ).fetch()

      if (existing.length > 0) {
        await existing[0].update(m => {
          m.champs_json = JSON.stringify(champs)
        })
      } else {
        await database.get('mesures').create(m => {
          m.client_id   = clientId ?? ''
          m.vetement_id = vetement_id ?? ''
          m.champs_json = JSON.stringify(champs)
          m.is_archived = false
          m.atelier_id  = getAtelierId()
        })
      }
    })
  })
}
