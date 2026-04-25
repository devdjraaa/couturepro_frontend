import { useCommandeStats } from './useCommandes'
import { useQuota } from './useQuota'
import { useNotificationsCount } from './useNotifications'

export function useDashboard() {
  const stats  = useCommandeStats()
  const quota  = useQuota()
  const badge  = useNotificationsCount()

  return {
    isLoading: stats.isLoading || quota.isLoading,
    isError:   stats.isError   || quota.isError,

    // Indicateurs commandes
    en_cours:       stats.data?.en_cours       ?? 0,
    essai:          stats.data?.essai          ?? 0,
    livre:          stats.data?.livre          ?? 0,
    annule:         stats.data?.annule         ?? 0,
    total_encaisse: stats.data?.total_encaisse ?? 0,
    total_restant:  stats.data?.total_restant  ?? 0,

    // Quotas
    quota: quota.data ?? null,

    // Badge notifications non lues
    notificationsNonLues: badge.data ?? 0,
  }
}
