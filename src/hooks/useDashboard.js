import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotificationsCount } from './useNotifications'
import { QUERY_KEYS } from './queryKeys'
import api from '@/services/api'
import { isMock } from '@/services/mockFlag'
import { commandeService } from '@/services/commandeService'

async function fetchDashboard() {
  if (isMock()) {
    const stats = await commandeService.getStats()
    return {
      commandes: {
        en_cours:          stats.en_cours  ?? 0,
        livrees:           stats.livre     ?? 0,
        annulees:          stats.annule    ?? 0,
        en_retard:         stats.en_retard ?? 0,
        urgentes:          0,
        livraison_aujd:    stats.dans_48h  ?? 0,
        nouvelles_ce_mois: 0,
      },
      finances: {
        encaisse_mois:     stats.total_encaisse ?? 0,
        reste_a_encaisser: stats.total_restant  ?? 0,
      },
      clients: { total: 0, nouveaux_mois: 0, vip: 0 },
      abonnement: null,
      synced_at: new Date().toISOString(),
    }
  }
  const { data } = await api.get('/dashboard')
  return data
}

export function useDashboard() {
  const qc    = useQueryClient()
  const badge = useNotificationsCount()
  const query = useQuery({
    queryKey: QUERY_KEYS.dashboard,
    queryFn:  fetchDashboard,
    staleTime: 60_000,
    refetchInterval: 120_000,
  })

  const refresh = () => qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard })
  const d = query.data

  return {
    isLoading: query.isLoading,
    isError:   query.isError,
    refresh,

    en_cours:         d?.commandes?.en_cours          ?? 0,
    livre:            d?.commandes?.livrees            ?? 0,
    annule:           d?.commandes?.annulees           ?? 0,
    total_encaisse:   d?.finances?.encaisse_mois       ?? 0,
    total_restant:    d?.finances?.reste_a_encaisser   ?? 0,
    en_retard:        d?.commandes?.en_retard          ?? 0,
    urgentes:         d?.commandes?.urgentes           ?? 0,
    livraison_aujd:   d?.commandes?.livraison_aujd     ?? 0,
    nouveaux_clients: d?.clients?.nouveaux_mois        ?? 0,
    dans_48h:         d?.commandes?.livraison_aujd     ?? 0,
    abonnement:       d?.abonnement                   ?? null,
    synced_at:        d?.synced_at                    ?? null,

    notificationsNonLues: badge.data ?? 0,
  }
}
