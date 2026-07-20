import adminApi from '../adminApi'

/**
 * Tableau de bord analytique interne (P202 phase 5).
 *
 * Le calcul existe côté serveur depuis le 16/07 et la collecte tourne depuis :
 * visiteurs, segments clients, scores de confiance des designers, tendances.
 * Il n'y avait simplement AUCUN écran pour le consulter — la donnée s'accumulait
 * sans que personne puisse la lire.
 */
export const analytiqueAdminService = {
  async get() {
    const { data } = await adminApi.get('/analytique')
    return data
  },
}
