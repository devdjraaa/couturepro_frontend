import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
<<<<<<< HEAD
import { clientService } from '@/services/clientService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'
=======
import { Q } from '@nozbe/watermelondb'
import { useWmQuery, useMutation, database } from '@/db/useWmQuery'
import { logAction } from '@/utils/historique'

// Offline-first : clients lus/écrits dans WatermelonDB (comme mesures/vêtements).
// La sync (syncAdapter) pousse/tire ces données ; l'app fonctionne donc hors-ligne.

function getAtelierId() {
  return localStorage.getItem('cp_active_atelier') || ''
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
>>>>>>> d0b5c7e (fix(historique): alimenter l'historique local (SUG-20 — logAction n'était jamais appelé))

export function useClients(filters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.clients, filters],
    queryFn: () => clientService.getAll(filters),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useClient(id) {
  return useQuery({
    queryKey: QUERY_KEYS.client(id),
    queryFn: () => clientService.getById(id),
    enabled: !!id,
    staleTime: QUERY_STALE_TIME,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => {
      const cached = queryClient.getQueryData([...QUERY_KEYS.clients, {}]) ?? []
      const nom    = payload.nom?.toLowerCase().trim() ?? ''
      const prenom = payload.prenom?.toLowerCase().trim() ?? ''
      const exists = cached.some(c =>
        c.nom.toLowerCase().trim() === nom &&
        (c.prenom?.toLowerCase().trim() ?? '') === prenom,
      )
      if (exists) {
        const err = new Error(`Un client nommé "${payload.prenom ? payload.prenom + ' ' : ''}${payload.nom}" existe déjà.`)
        err.code = 'doublon'
        throw err
      }
<<<<<<< HEAD
      return clientService.create(payload)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notificationsCount })
      const nom = [data?.prenom, data?.nom].filter(Boolean).join(' ')
      toast.success(`Client ${nom} ajouté avec succès.`)
    },
=======

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
>>>>>>> d0b5c7e (fix(historique): alimenter l'historique local (SUG-20 — logAction n'était jamais appelé))
  })
}

export function useUpdateClient() {
<<<<<<< HEAD
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => clientService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.setQueryData(QUERY_KEYS.client(data.id), data)
    },
=======
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
>>>>>>> d0b5c7e (fix(historique): alimenter l'historique local (SUG-20 — logAction n'était jamais appelé))
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => clientService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.removeQueries({ queryKey: QUERY_KEYS.client(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
    },
  })
}

export function useArchiverClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => clientService.archiver(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.removeQueries({ queryKey: QUERY_KEYS.client(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
    },
  })
}

export function useToggleVip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => clientService.toggleVip(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.setQueryData(QUERY_KEYS.client(data.id), data)
    },
  })
}
