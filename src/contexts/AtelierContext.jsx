import { createContext, useContext, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { QUOTA_LIMITS, ABONNEMENT_PRIX } from '@/constants/config'
import { ABONNEMENT_NIVEAU } from '@/constants/enums'

const AtelierContext = createContext(null)

export function AtelierProvider({ children }) {
  const { atelier, updateAtelierLocal, refreshAtelier } = useAuth()

  // Données dérivées calculées une seule fois par changement d'atelier
  const derived = useMemo(() => {
    if (!atelier) return null

    const niveau   = atelier.abonnement?.niveau ?? ABONNEMENT_NIVEAU.GRATUIT
    const limits   = QUOTA_LIMITS[niveau] ?? QUOTA_LIMITS.gratuit
    const statut   = atelier.abonnement?.statut ?? 'expire'
    const isPro    = niveau === ABONNEMENT_NIVEAU.PRO || niveau === ABONNEMENT_NIVEAU.MAGNAT
    const isActif  = statut === 'actif'

    const clientsUtilises   = atelier.abonnement?.clients_total ?? 0
    const commandesCeMois   = atelier.abonnement?.commandes_ce_mois ?? 0
    const clientsRestants   = limits.clients === -1 ? Infinity : Math.max(0, limits.clients - clientsUtilises)
    const commandesRestantes = limits.commandes_par_mois === -1 ? Infinity : Math.max(0, limits.commandes_par_mois - commandesCeMois)

    const peutAjouterClient   = limits.clients === -1 || clientsUtilises < limits.clients
    const peutAjouterCommande = limits.commandes_par_mois === -1 || commandesCeMois < limits.commandes_par_mois

    return {
      niveau,
      statut,
      isPro,
      isActif,
      limits,
      clientsUtilises,
      commandesCeMois,
      clientsRestants,
      commandesRestantes,
      peutAjouterClient,
      peutAjouterCommande,
      points: atelier.points ?? 0,
      joursPoints: Math.floor((atelier.points ?? 0) / 10),
      prix: ABONNEMENT_PRIX[niveau] ?? null,
    }
  }, [atelier])

  return (
    <AtelierContext.Provider value={{
      atelier,
      derived,
      updateAtelierLocal,
      refreshAtelier,
    }}>
      {children}
    </AtelierContext.Provider>
  )
}

export function useAtelier() {
  const ctx = useContext(AtelierContext)
  if (!ctx) throw new Error('useAtelier doit être utilisé à l\'intérieur de AtelierProvider')
  return ctx
}
