import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { Q } from '@nozbe/watermelondb'
import { useWmQuery, useMutation, database } from '@/db/useWmQuery'
import { logAction } from '@/utils/historique'

// Offline-first : clients lus/écrits dans WatermelonDB (comme mesures/vêtements).
// La sync (syncAdapter) pousse/tire ces données ; l'app fonctionne donc hors-ligne.

// Id RÉEL de l'atelier actif (maître inclus), pour isoler strictement les données (P62-65).
function getAtelierId() {
  return localStorage.getItem('cp_atelier_local') || localStorage.getItem('cp_active_atelier') || ''
}

// Mappe un record WatermelonDB vers l'objet « plat » attendu par les écrans
// (même forme que l'API), en ajoutant commandes_count calculé localement.
function toPlain(record, count) {
  return {
    id:              record.id,
    nom:             record.nom,
    prenom:          record.prenom,
    telephone:       record.telephone,
    type_profil:     record.type_profil,
    avatar_index:    record.avatar_index,
    is_vip:          record.is_vip,
    is_archived:     record.is_archived,
    notes:           record.notes,
    nomComplet:      record.nomComplet,
    created_at:      record._raw.created_at ?? null,
    commandes_count: count ?? 0,
  }
}

export function useClients(filters = {}) {
  const atelierId = getAtelierId()
  const { data: clients, isLoading } = useWmQuery(() => {
    const conditions = [Q.where('is_archived', false)]
    if (atelierId) conditions.push(Q.where('atelier_id', atelierId))   // isolation par atelier (P62-65)
    if (filters.type_profil) conditions.push(Q.where('type_profil', filters.type_profil))
    if (filters.search) {
      const s = Q.sanitizeLikeString(filters.search)
      conditions.push(Q.or(
        Q.where('nom',       Q.like(`%${s}%`)),
        Q.where('prenom',    Q.like(`%${s}%`)),
        Q.where('telephone', Q.like(`%${s}%`)),
      ))
    }
    return database.get('clients').query(...conditions)
  }, [filters.type_profil, filters.search, atelierId])

  // Commandes locales pour le compteur par client (même atelier).
  const { data: commandes } = useWmQuery(
    () => {
      const conds = [Q.where('is_archived', false)]
      if (atelierId) conds.push(Q.where('atelier_id', atelierId))
      return database.get('commandes').query(...conds)
    },
    [atelierId],
  )

  const data = useMemo(() => {
    const counts = {}
    for (const c of commandes) counts[c.client_id] = (counts[c.client_id] ?? 0) + 1
    return clients.map(c => toPlain(c, counts[c.id]))
  }, [clients, commandes])

  return { data, isLoading }
}

export function useClient(id) {
  const { data: clients, isLoading } = useWmQuery(
    () => database.get('clients').query(Q.where('id', id ?? '')),
    [id],
  )
  const { data: commandes } = useWmQuery(
    () => database.get('commandes').query(Q.where('client_id', id ?? ''), Q.where('is_archived', false)),
    [id],
  )
  const data = useMemo(() => {
    const c = clients[0]
    return c ? toPlain(c, commandes.length) : null
  }, [clients, commandes])
  return { data, isLoading }
}

export function useCreateClient() {
  return useMutation(async (payload) => {
    const nom    = payload.nom?.toLowerCase().trim() ?? ''
    const prenom = payload.prenom?.toLowerCase().trim() ?? ''

    return database.write(async () => {
      // Anti-doublon (même nom + prénom, non archivé).
      const existing = await database.get('clients')
        .query(Q.where('is_archived', false)).fetch()
      const dup = existing.some(c =>
        (c.nom ?? '').toLowerCase().trim() === nom &&
        (c.prenom ?? '').toLowerCase().trim() === prenom,
      )
      if (dup) {
        const err = new Error(`Un client nommé "${payload.prenom ? payload.prenom + ' ' : ''}${payload.nom}" existe déjà.`)
        err.code = 'doublon'
        throw err
      }

      const record = await database.get('clients').create(c => {
        c.nom          = payload.nom ?? ''
        c.prenom       = payload.prenom ?? ''
        c.telephone    = payload.telephone ?? ''
        c.type_profil  = payload.type_profil ?? 'mixte'
        c.avatar_index = payload.avatar_index ?? null
        c.is_vip       = Boolean(payload.is_vip)
        c.is_archived  = false
        c.notes        = payload.notes ?? ''
        c.atelier_id   = getAtelierId()
      })
      const nomComplet = [record.prenom, record.nom].filter(Boolean).join(' ')
      toast.success(`Client ${nomComplet} ajouté avec succès.`)
      logAction('client_cree', nomComplet)
      return toPlain(record, 0)
    })
  })
}

export function useUpdateClient() {
  return useMutation(async ({ id, ...payload }) => {
    return database.write(async () => {
      const record = await database.get('clients').find(id)
      await record.update(c => {
        if (payload.nom          !== undefined) c.nom          = payload.nom
        if (payload.prenom       !== undefined) c.prenom       = payload.prenom
        if (payload.telephone    !== undefined) c.telephone    = payload.telephone
        if (payload.type_profil  !== undefined) c.type_profil  = payload.type_profil
        if (payload.avatar_index !== undefined) c.avatar_index = payload.avatar_index
        if (payload.is_vip       !== undefined) c.is_vip       = Boolean(payload.is_vip)
        if (payload.notes        !== undefined) c.notes        = payload.notes
      })
      logAction('client_modifie', [record.prenom, record.nom].filter(Boolean).join(' '))
      return toPlain(record, 0)
    })
  })
}

export function useDeleteClient() {
  return useMutation(async (id) => {
    await database.write(async () => {
      const record = await database.get('clients').find(id)
      await record.markAsDeleted()   // soft-delete synchronisé
    })
  })
}

export function useArchiverClient() {
  return useMutation(async (id) => {
    await database.write(async () => {
      const record = await database.get('clients').find(id)
      await record.update(c => { c.is_archived = true })
    })
  })
}

export function useToggleVip() {
  return useMutation(async (id) => {
    return database.write(async () => {
      const record = await database.get('clients').find(id)
      await record.update(c => { c.is_vip = !c.is_vip })
      return toPlain(record, 0)
    })
  })
}
