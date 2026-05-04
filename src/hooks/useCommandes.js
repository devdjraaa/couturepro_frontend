import { useMemo } from 'react'
import { Q } from '@nozbe/watermelondb'
import { useWmQuery, useWmRecord, useMutation, database } from '@/db/useWmQuery'

function getAtelierId() {
  return localStorage.getItem('cp_active_atelier') || ''
}

export function useCommandes(filters = {}) {
  return useWmQuery(() => {
    const conditions = [Q.where('is_archived', false)]
    if (filters.statut)    conditions.push(Q.where('statut', filters.statut))
    if (filters.client_id) conditions.push(Q.where('client_id', filters.client_id))
    if (filters.search) {
      const s = Q.sanitizeLikeString(filters.search)
      conditions.push(
        Q.or(
          Q.where('client_nom',  Q.like(`%${s}%`)),
          Q.where('description', Q.like(`%${s}%`)),
        ),
      )
    }
    return database.get('commandes').query(...conditions)
  }, [filters.statut, filters.client_id, filters.search])
}

export function useCommande(id) {
  return useWmRecord('commandes', id)
}

export function useCommandeStats() {
  const { data: commandes, isLoading } = useWmQuery(
    () => database.get('commandes').query(Q.where('is_archived', false)),
    [],
  )

  const data = useMemo(() => {
    const now = new Date()
    const in48h = new Date(now.getTime() + 48 * 3_600_000)
    const nonTerminees = commandes.filter(c => c.statut === 'en_cours')

    return {
      en_retard: nonTerminees.filter(c =>
        c.date_livraison_prevue && new Date(c.date_livraison_prevue) < now,
      ).length,
      dans_48h: nonTerminees.filter(c => {
        if (!c.date_livraison_prevue) return false
        const d = new Date(c.date_livraison_prevue)
        return d >= now && d <= in48h
      }).length,
      en_cours: nonTerminees.length,
      total: commandes.length,
    }
  }, [commandes])

  return { data, isLoading }
}

export function useCreateCommande() {
  return useMutation(async (payload) => {
    await database.write(async () => {
      await database.get('commandes').create(record => {
        record.client_id             = payload.client_id ?? ''
        record.vetement_id           = payload.vetement_id ?? null
        record.client_nom            = payload.client_nom ?? ''
        record.vetement_nom          = payload.vetement_nom ?? ''
        record.quantite              = payload.quantite ?? 1
        record.prix                  = Number(payload.prix ?? 0)
        record.acompte               = Number(payload.acompte ?? 0)
        record.mode_paiement_acompte = payload.mode_paiement_acompte ?? null
        record.statut                = 'en_cours'
        record.description           = payload.description ?? ''
        record.note_interne          = payload.note_interne ?? ''
        record.date_livraison_prevue = payload.date_livraison_prevue ?? null
        record.urgence               = Boolean(payload.urgence)
        record.is_archived           = false
        record.rappel_j2_envoye      = false
        record.atelier_id            = getAtelierId()
      })
    })
  })
}

export function useUpdateCommande() {
  return useMutation(async ({ id, ...payload }) => {
    await database.write(async () => {
      const record = await database.get('commandes').find(id)
      await record.update(r => {
        Object.entries(payload).forEach(([key, val]) => {
          if (val !== undefined && key in r) r[key] = val
        })
      })
    })
  })
}

export function useUpdateStatutCommande() {
  return useMutation(async ({ id, statut }) => {
    await database.write(async () => {
      const record = await database.get('commandes').find(id)
      await record.update(r => {
        r.statut = statut
        if (statut === 'livre') {
          r.date_livraison_effective = new Date().toISOString()
        }
      })
    })
  })
}

export function useDeleteCommande() {
  return useMutation(async (id) => {
    await database.write(async () => {
      const record = await database.get('commandes').find(id)
      await record.markAsDeleted()
    })
  })
}
