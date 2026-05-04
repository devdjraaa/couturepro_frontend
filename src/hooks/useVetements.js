import { Q } from '@nozbe/watermelondb'
import { useWmQuery, useWmRecord, useMutation, database } from '@/db/useWmQuery'

function getAtelierId() {
  return localStorage.getItem('cp_active_atelier') || ''
}

export function useVetements(filters = {}) {
  return useWmQuery(() => {
    const conditions = [Q.where('is_archived', false)]
    if (filters.is_systeme !== undefined) conditions.push(Q.where('is_systeme', Boolean(filters.is_systeme)))
    if (filters.search) {
      const s = Q.sanitizeLikeString(filters.search)
      conditions.push(Q.where('nom', Q.like(`%${s}%`)))
    }
    return database.get('vetements').query(...conditions)
  }, [filters.is_systeme, filters.search])
}

export function useVetement(id) {
  return useWmRecord('vetements', id)
}

export function useCreateVetement() {
  return useMutation(async (payload) => {
    await database.write(async () => {
      await database.get('vetements').create(record => {
        record.nom                   = payload.nom ?? ''
        record.categorie             = payload.categorie ?? ''
        record.description           = payload.description ?? ''
        record.libelles_mesures_json = JSON.stringify(payload.libelles_mesures ?? [])
        record.images_json           = JSON.stringify(payload.images ?? [])
        record.image_url             = payload.image_url ?? ''
        record.est_gabarit           = Boolean(payload.est_gabarit)
        record.is_systeme            = false
        record.is_archived           = false
        record.template_numero       = payload.template_numero ?? null
        record.atelier_id            = getAtelierId()
      })
    })
  })
}

export function useUpdateVetement() {
  return useMutation(async ({ id, ...payload }) => {
    await database.write(async () => {
      const record = await database.get('vetements').find(id)
      await record.update(r => {
        if (payload.nom               !== undefined) r.nom                   = payload.nom
        if (payload.categorie         !== undefined) r.categorie             = payload.categorie
        if (payload.description       !== undefined) r.description           = payload.description
        if (payload.libelles_mesures  !== undefined) r.libelles_mesures_json = JSON.stringify(payload.libelles_mesures)
        if (payload.images            !== undefined) r.images_json           = JSON.stringify(payload.images)
        if (payload.image_url         !== undefined) r.image_url             = payload.image_url
        if (payload.est_gabarit       !== undefined) r.est_gabarit           = Boolean(payload.est_gabarit)
      })
    })
  })
}

export function useDeleteVetement() {
  return useMutation(async (id) => {
    await database.write(async () => {
      const record = await database.get('vetements').find(id)
      await record.markAsDeleted()
    })
  })
}
