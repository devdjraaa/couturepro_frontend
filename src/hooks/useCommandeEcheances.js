import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { Q } from '@nozbe/watermelondb'
import { useWmQuery, useMutation, database } from '@/db/useWmQuery'

// Offline-first : échéances d'une commande dans WatermelonDB (sync serveur).

function toPlain(e) {
  return {
    id:            e.id,
    commande_id:   e.commande_id,
    date_echeance: e.date_echeance,
    note:          e.note,
    livree:        e.livree,
    livree_at:     e.livree_at,
  }
}

export function useCommandeEcheances(commandeId) {
  const { data: records, isLoading } = useWmQuery(
    () => database.get('commande_echeances').query(Q.where('commande_id', commandeId ?? '')),
    [commandeId],
  )
  const data = useMemo(
    () => records.map(toPlain).sort((a, b) => String(a.date_echeance ?? '').localeCompare(String(b.date_echeance ?? ''))),
    [records],
  )
  return { data, isLoading }
}

export function useCreateEcheance(commandeId) {
  return useMutation(async (payload) => {
    await database.write(async () => {
      await database.get('commande_echeances').create(r => {
        r.commande_id   = commandeId ?? ''
        r.date_echeance = payload.date_echeance ?? null
        r.note          = payload.note ?? ''
        r.livree        = Boolean(payload.livree)
      })
    })
    toast.success('Échéance ajoutée.')
  })
}

export function useUpdateEcheance(commandeId) {
  return useMutation(async ({ id, ...payload }) => {
    await database.write(async () => {
      const record = await database.get('commande_echeances').find(id)
      await record.update(r => {
        if (payload.date_echeance !== undefined) r.date_echeance = payload.date_echeance
        if (payload.note          !== undefined) r.note          = payload.note
        if (payload.livree        !== undefined) {
          r.livree    = Boolean(payload.livree)
          r.livree_at = payload.livree ? new Date().toISOString() : null
        }
      })
    })
  })
}

export function useDeleteEcheance(commandeId) {
  return useMutation(async (id) => {
    await database.write(async () => {
      const record = await database.get('commande_echeances').find(id)
      await record.markAsDeleted()
    })
    toast.success('Échéance supprimée.')
  })
}
