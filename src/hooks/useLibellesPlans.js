import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL } from '@/constants/config'
import { QUERY_KEYS } from './queryKeys'

/**
 * Libellés des fonctionnalités des plans, édités depuis le back-office.
 *
 * Sert la MÊME source que la page de tarifs publique : renommer une ligne en
 * administration doit se voir dans l'application aussi, sans redéploiement.
 * Réglage public, donc pas d'authentification — et un échec est sans gravité :
 * `featuresFromConfig` retombe sur les textes livrés.
 */
export function useLibellesPlans() {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.libellesPlans,
    queryFn: async () => {
      const r = await fetch(`${API_BASE_URL}/vitrine/tarification`, {
        headers: { Accept: 'application/json' },
      })
      if (!r.ok) throw new Error('tarification')
      return r.json()
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })

  return data?.libelles ?? null
}
