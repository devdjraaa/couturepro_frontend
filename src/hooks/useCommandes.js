import { useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Q } from '@nozbe/watermelondb'
import { useWmQuery, database } from '@/db/useWmQuery'
import { syncWithServer } from '@/db/syncAdapter'
import { commandeService } from '@/services/commandeService'
import { QUERY_KEYS } from './queryKeys'

// Offline-first : listes, détail & stats des commandes lus dans WatermelonDB
// (dispo hors-ligne). Les mutations (create/update/statut/delete) restent sur
// l'API (create multi-items) mais déclenchent une sync pour rafraîchir le local.

function isLate(c) {
  return c.date_livraison_prevue && new Date(c.date_livraison_prevue) < new Date() && c.statut === 'en_cours'
}
function isIn48h(c) {
  if (!c.date_livraison_prevue || c.statut !== 'en_cours') return false
  const diff = new Date(c.date_livraison_prevue) - new Date()
  return diff > 0 && diff <= 48 * 3_600_000
}

function toPlain(c) {
  return {
    id:                      c.id,
    client_id:               c.client_id,
    vetement_id:             c.vetement_id,
    reference:               c.reference,
    etape:                   c.etape,
    client:                  c.client_nom ? { nom: c.client_nom } : null,
    client_nom:              c.client_nom,
    vetement_nom:            c.vetement_nom,
    quantite:                c.quantite,
    prix:                    c.prix,
    acompte:                 c.acompte,
    mode_paiement_acompte:   c.mode_paiement_acompte,
    statut:                  c.statut,
    description:             c.description,
    note_interne:            c.note_interne,
    date_livraison_prevue:   c.date_livraison_prevue,
    date_livraison_effective: c.date_livraison_effective,
    urgence:                 c.urgence,
    is_archived:             c.is_archived,
    photo_tissu_url:         c.photo_tissu_url,
    created_at:              c._raw.created_at ?? null,
  }
}

export function useCommandes(filters = {}) {
  const { data: records, isLoading } = useWmQuery(() => {
    const conditions = [Q.where('is_archived', false)]
    if (filters.statut) conditions.push(Q.where('statut', filters.statut))
    if (filters.search) {
      const s = Q.sanitizeLikeString(filters.search)
      conditions.push(Q.or(
        Q.where('client_nom',   Q.like(`%${s}%`)),
        Q.where('vetement_nom', Q.like(`%${s}%`)),
      ))
    }
    return database.get('commandes').query(...conditions)
  }, [filters.statut, filters.search])

  const data = useMemo(() => records.map(toPlain), [records])
  return { data, isLoading }
}

// Détail : offline-first (WatermelonDB). Les sous-données (items, paiements,
// échéances) ont leurs propres hooks WatermelonDB.
export function useCommande(id) {
  const { data: records, isLoading } = useWmQuery(
    () => database.get('commandes').query(Q.where('id', id ?? '')),
    [id],
  )
  const data = useMemo(() => (records[0] ? toPlain(records[0]) : null), [records])
  return { data, isLoading }
}

// Stats calculées localement (offline) depuis commandes + clients.
export function useCommandeStats() {
  const { data: commandes } = useWmQuery(
    () => database.get('commandes').query(Q.where('is_archived', false)), [],
  )
  const { data: clients } = useWmQuery(
    () => database.get('clients').query(Q.where('is_archived', false)), [],
  )
  const data = useMemo(() => {
    let en_cours = 0, en_retard = 0, dans_48h = 0, livre = 0, total_encaisse = 0, total_restant = 0
    for (const c of commandes) {
      total_encaisse += Number(c.acompte) || 0
      if (c.statut === 'en_cours') {
        en_cours++
        total_restant += Math.max(0, (Number(c.prix) || 0) - (Number(c.acompte) || 0))
        if (isLate(c))  en_retard++
        if (isIn48h(c)) dans_48h++
      } else if (c.statut === 'livre') {
        livre++
      }
    }
    return { total_clients: clients.length, total_commandes: commandes.length, en_cours, en_retard, dans_48h, livre, total_encaisse, total_restant }
  }, [commandes, clients])
  return { data, isLoading: false }
}

// ── Mutations : API + sync pour rafraîchir le local ──────────────────────────
function refreshLocal() {
  syncWithServer().catch(() => { /* hors-ligne : la sync repassera */ })
}

export function useCreateCommande() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => commandeService.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
      refreshLocal()
      const client = data?.client?.prenom
        ? `${data.client.prenom} ${data.client.nom}`
        : (data?.client?.nom ?? data?.client_nom ?? 'client')
      toast.success(`Commande pour ${client} créée avec succès.`)
    },
  })
}

export function useUpdateCommande() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => commandeService.update(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.commande(data.id), data)
      refreshLocal()
    },
  })
}

export function useUpdateStatutCommande() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, statut }) => commandeService.updateStatut(id, statut),
    onSuccess: (data, { statut }) => {
      queryClient.setQueryData(QUERY_KEYS.commande(data.id), data)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
      refreshLocal()
      const messages = {
        livre:    'Commande marquée comme livrée.',
        annule:   'Commande annulée.',
        en_cours: 'Commande remise en cours.',
      }
      toast.success(messages[statut] ?? 'Statut mis à jour.')
    },
  })
}

export function useDeleteCommande() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => commandeService.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.commande(id) })
      refreshLocal()
    },
  })
}
