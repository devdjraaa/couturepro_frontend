import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { commandeService } from '@/services/commandeService'
<<<<<<< HEAD
import { QUERY_STALE_TIME } from '@/constants/config'
=======
import { logAction } from '@/utils/historique'
>>>>>>> d0b5c7e (fix(historique): alimenter l'historique local (SUG-20 — logAction n'était jamais appelé))
import { QUERY_KEYS } from './queryKeys'

export function useCommandes(filters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.commandes, filters],
    queryFn: () => commandeService.getAll(filters),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useCommande(id) {
  return useQuery({
    queryKey: QUERY_KEYS.commande(id),
    queryFn: () => commandeService.getById(id),
    enabled: !!id,
    staleTime: QUERY_STALE_TIME,
  })
}

export function useCommandeStats() {
  return useQuery({
    queryKey: QUERY_KEYS.commandeStats,
    queryFn: () => commandeService.getStats(),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useCreateCommande() {
<<<<<<< HEAD
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => commandeService.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandeStats })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notificationsCount })
      const client = data?.client?.prenom
        ? `${data.client.prenom} ${data.client.nom}`
        : (data?.client?.nom ?? 'client')
      toast.success(`Commande pour ${client} créée avec succès.`)
    },
=======
  return useWmMutation(async (payload) => {
    return database.write(async () => {
      let client_nom = payload.client_nom ?? ''
      if (!client_nom && payload.client_id) {
        const c = await database.get('clients').find(payload.client_id).catch(() => null)
        if (c) client_nom = [c.prenom, c.nom].filter(Boolean).join(' ')
      }
      let vetement_nom = payload.vetement_nom ?? ''
      if (!vetement_nom && payload.vetement_id) {
        const v = await database.get('vetements').find(payload.vetement_id).catch(() => null)
        if (v) vetement_nom = v.nom
      }

      const record = await database.get('commandes').create(c => {
        c.client_id             = payload.client_id ?? ''
        c.client_nom            = client_nom
        c.vetement_id           = payload.vetement_id ?? null
        c.vetement_nom          = vetement_nom
        c.quantite              = Number(payload.quantite) || 1
        c.prix                  = Number(payload.prix) || 0
        c.acompte               = Number(payload.acompte) || 0
        c.mode_paiement_acompte = payload.mode_paiement_acompte ?? null
        c.statut                = 'en_cours'
        c.etape                 = 'commande'
        c.description           = payload.description ?? ''
        c.note_interne          = payload.note_interne ?? ''
        c.date_livraison_prevue = payload.date_livraison_prevue ?? null
        c.urgence               = Boolean(payload.urgence)
        c.is_archived           = false
        c.atelier_id            = getAtelierId()
      })
      toast.success(`Commande pour ${client_nom || 'client'} créée avec succès.`)
      logAction('commande_creee', client_nom || '')
      return toPlain(record)
    })
>>>>>>> d0b5c7e (fix(historique): alimenter l'historique local (SUG-20 — logAction n'était jamais appelé))
  })
}

export function useUpdateCommande() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }) => commandeService.update(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.commande(data.id), data)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandeStats })
    },
  })
}

export function useUpdateStatutCommande() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, statut }) => commandeService.updateStatut(id, statut),
    onSuccess: (data, { statut }) => {
      queryClient.setQueryData(QUERY_KEYS.commande(data.id), data)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandeStats })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notificationsCount })
      const messages = {
        livre:    'Commande marquée comme livrée.',
        annule:   'Commande annulée.',
        en_cours: 'Commande remise en cours.',
      }
      toast.success(messages[statut] ?? 'Statut mis à jour.')
      if (statut === 'livre') logAction('commande_livree', data?.client_nom || '')
    },
  })
}

export function useDeleteCommande() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => commandeService.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.commande(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandeStats })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quota })
    },
  })
}
