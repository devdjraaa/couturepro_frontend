import { Q } from '@nozbe/watermelondb'
import { useWmQuery, useWmRecord, useMutation, database } from '@/db/useWmQuery'

function getAtelierId() {
  return localStorage.getItem('cp_active_atelier') || ''
}

export function useClients(filters = {}) {
  return useWmQuery(() => {
    const conditions = [Q.where('is_archived', false)]
    if (filters.search) {
      const s = Q.sanitizeLikeString(filters.search)
      conditions.push(
        Q.or(
          Q.where('nom',       Q.like(`%${s}%`)),
          Q.where('prenom',    Q.like(`%${s}%`)),
          Q.where('telephone', Q.like(`%${s}%`)),
        ),
      )
    }
    if (filters.type_profil) conditions.push(Q.where('type_profil', filters.type_profil))
    if (filters.is_vip)      conditions.push(Q.where('is_vip', true))
    return database.get('clients').query(...conditions)
  }, [filters.search, filters.type_profil, filters.is_vip])
}

export function useClient(id) {
  return useWmRecord('clients', id)
}

export function useCreateClient() {
  return useMutation(async (payload) => {
    // Anti-doublon local
    const nom    = payload.nom?.toLowerCase().trim() ?? ''
    const prenom = payload.prenom?.toLowerCase().trim() ?? ''
    const existing = await database.get('clients').query(
      Q.where('is_archived', false),
    ).fetch()
    const doublon = existing.find(c =>
      c.nom.toLowerCase().trim() === nom &&
      (c.prenom?.toLowerCase().trim() ?? '') === prenom,
    )
    if (doublon) {
      const err = new Error(`Un client nommé "${payload.prenom ? payload.prenom + ' ' : ''}${payload.nom}" existe déjà.`)
      err.code = 'doublon'
      throw err
    }

    await database.write(async () => {
      await database.get('clients').create(record => {
        record.nom         = payload.nom ?? ''
        record.prenom      = payload.prenom ?? ''
        record.telephone   = payload.telephone ?? ''
        record.type_profil = payload.type_profil ?? 'mixte'
        record.notes       = payload.notes ?? ''
        record.avatar_index = payload.avatar_index ?? null
        record.is_vip      = false
        record.is_archived = false
        record.atelier_id  = getAtelierId()
      })
    })
  })
}

export function useUpdateClient() {
  return useMutation(async ({ id, ...payload }) => {
    await database.write(async () => {
      const record = await database.get('clients').find(id)
      await record.update(r => {
        if (payload.nom         !== undefined) r.nom         = payload.nom
        if (payload.prenom      !== undefined) r.prenom      = payload.prenom
        if (payload.telephone   !== undefined) r.telephone   = payload.telephone
        if (payload.type_profil !== undefined) r.type_profil = payload.type_profil
        if (payload.notes       !== undefined) r.notes       = payload.notes
        if (payload.avatar_index !== undefined) r.avatar_index = payload.avatar_index
        if (payload.is_vip      !== undefined) r.is_vip      = payload.is_vip
      })
    })
  })
}

export function useDeleteClient() {
  return useMutation(async (id) => {
    await database.write(async () => {
      const record = await database.get('clients').find(id)
      await record.markAsDeleted()
    })
  })
}

export function useArchiverClient() {
  return useMutation(async (id) => {
    await database.write(async () => {
      const record = await database.get('clients').find(id)
      await record.update(r => { r.is_archived = true })
    })
  })
}

export function useToggleVip() {
  return useMutation(async (id) => {
    await database.write(async () => {
      const record = await database.get('clients').find(id)
      await record.update(r => {
        r.is_vip      = !r.is_vip
        r.type_profil = r.is_vip ? 'vip' : 'regulier'
      })
    })
  })
}
