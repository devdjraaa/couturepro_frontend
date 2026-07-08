import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { Q } from '@nozbe/watermelondb'
import { useWmQuery, useMutation, database } from '@/db/useWmQuery'

// Offline-first : articles (items) d'une commande dans WatermelonDB (sync serveur).

function toPlain(it) {
  return {
    id:            it.id,
    commande_id:   it.commande_id,
    vetement_id:   it.vetement_id,
    vetement_nom:  it.vetement_nom,
    quantite:      it.quantite,
    prix_unitaire: it.prix_unitaire,
    description:   it.description,
  }
}

export function useCommandeItems(commandeId) {
  const { data: records, isLoading } = useWmQuery(
    () => database.get('commande_items').query(Q.where('commande_id', commandeId ?? '')),
    [commandeId],
  )
  const data = useMemo(() => records.map(toPlain), [records])
  return { data, isLoading }
}

export function useCreateCommandeItems(commandeId) {
  return useMutation(async (items) => {
    await database.write(async () => {
      const coll = database.get('commande_items')
      await database.batch(
        ...(items ?? []).map(it => coll.prepareCreate(r => {
          r.commande_id   = commandeId ?? ''
          r.vetement_id   = it.vetement_id ?? null
          r.vetement_nom  = it.vetement_nom ?? ''
          r.quantite      = Number(it.quantite) || 1
          r.prix_unitaire = Number(it.prix_unitaire) || 0
          r.description   = it.description ?? ''
        })),
      )
    })
  })
}

export function useUpdateCommandeItem(commandeId) {
  return useMutation(async ({ itemId, ...payload }) => {
    await database.write(async () => {
      const record = await database.get('commande_items').find(itemId)
      await record.update(r => {
        if (payload.vetement_nom  !== undefined) r.vetement_nom  = payload.vetement_nom
        if (payload.quantite      !== undefined) r.quantite      = Number(payload.quantite)
        if (payload.prix_unitaire !== undefined) r.prix_unitaire = Number(payload.prix_unitaire)
        if (payload.description   !== undefined) r.description   = payload.description
      })
    })
  })
}

export function useDeleteCommandeItem(commandeId) {
  return useMutation(async (itemId) => {
    await database.write(async () => {
      const record = await database.get('commande_items').find(itemId)
      await record.markAsDeleted()
    })
    toast.success('Article supprimé.')
  })
}
