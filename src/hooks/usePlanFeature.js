import { useAbonnement } from './useAbonnement'

/**
 * Vérifie si une fonctionnalité est disponible dans le plan actuel.
 *
 * @param {string} featureKey — clé booléenne du config (ex: 'photos_vip')
 * @returns {{ available: boolean, isBlocked: boolean, isLoading: boolean }}
 *
 * isBlocked = abonnement expiré ou suspendu (indépendamment du plan)
 * available = la fonctionnalité est incluse dans le plan ET l'abonnement est actif
 */
export function usePlanFeature(featureKey) {
  const { data: abonnement, isLoading } = useAbonnement()

  if (isLoading) return { available: false, isBlocked: false, isLoading: true }

  const statut    = abonnement?.statut
  const isBlocked = statut === 'expire' || statut === 'gele'
  const config    = abonnement?.config ?? {}
  const available = !isBlocked && !!config[featureKey]

  return { available, isBlocked, isLoading: false }
}

/**
 * Vérifie si l'utilisateur a dépassé une limite numérique du plan.
 *
 * @param {string} limitKey — clé numérique du config (ex: 'max_membres')
 * @param {number} currentCount — valeur actuelle à comparer
 * @returns {{ allowed: boolean, max: number|null, isLoading: boolean }}
 *
 * max = null → illimité
 */
export function usePlanLimit(limitKey, currentCount = 0) {
  const { data: abonnement, isLoading } = useAbonnement()

  if (isLoading) return { allowed: false, max: null, isLoading: true }

  const config   = abonnement?.config ?? {}
  const rawMax   = config[limitKey] ?? null
  // null ou -1 = illimité
  const max      = (rawMax === null || rawMax === -1) ? null : rawMax

  return {
    allowed: max === null || currentCount < max,
    max,
    isLoading: false,
  }
}
