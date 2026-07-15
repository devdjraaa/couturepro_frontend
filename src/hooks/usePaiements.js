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

export function usePaiements(params = {}) {
  const commandeId = params.commande_id ?? params.commandeId
  const { data: records, isLoading } = useWmQuery(() => {
    const conds = commandeId ? [Q.where('commande_id', commandeId)] : []
    return database.get('paiements').query(...conds)
  }, [commandeId])

  const data = useMemo(() => records.map(toPlain), [records])
  return { data, isLoading }
}

export function useEnregistrerPaiement() {
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
  })
}
