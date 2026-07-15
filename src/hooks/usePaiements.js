<<<<<<< HEAD
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paiementService } from '@/services/paiementService'
import { QUERY_STALE_TIME } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'
=======
import { useMemo } from 'react'
import { Q } from '@nozbe/watermelondb'
import { useWmQuery, useMutation, database } from '@/db/useWmQuery'
import { logAction } from '@/utils/historique'

// Offline-first : paiements de commande lus/écrits dans WatermelonDB (sync serveur).

function getAtelierId() {
  return localStorage.getItem('cp_active_atelier') || ''
}

function toPlain(p) {
  return {
    id:             p.id,
    commande_id:    p.commande_id,
    montant:        p.montant,
    mode_paiement:  p.mode_paiement,
    enregistre_par: p.enregistre_par,
    date_paiement:  p.date_paiement,
    created_at:     p.date_paiement ?? p._raw.created_at ?? null,
  }
}
>>>>>>> d0b5c7e (fix(historique): alimenter l'historique local (SUG-20 — logAction n'était jamais appelé))

export function usePaiements(params = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.paiements, params],
    queryFn: () => paiementService.getAll(params),
    staleTime: QUERY_STALE_TIME,
  })
}

export function useEnregistrerPaiement() {
<<<<<<< HEAD
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ commandeId, ...payload }) => paiementService.enregistrer(commandeId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.paiements })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commande(variables.commandeId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.commandeStats })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.points })
    },
=======
  return useMutation(async ({ commandeId, montant, mode_paiement }) => {
    return database.write(async () => {
      const record = await database.get('paiements').create(p => {
        p.commande_id   = commandeId ?? ''
        p.montant       = Number(montant) || 0
        p.mode_paiement = mode_paiement ?? 'especes'
        p.atelier_id    = getAtelierId()
      })
      logAction('paiement_ajoute', `${Number(montant) || 0} XOF`)
      return toPlain(record)
    })
>>>>>>> d0b5c7e (fix(historique): alimenter l'historique local (SUG-20 — logAction n'était jamais appelé))
  })
}
