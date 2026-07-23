import adminApi from '../adminApi'

/**
 * Présentation de la page de tarifs : badge du plan mis en avant, note de bas
 * de grille, encart des options, essai offert — et les LIBELLÉS de chaque ligne
 * de fonctionnalité, servis à la fois à la vitrine et à l'application.
 */
export const tarificationAdminService = {
  async get() {
    const { data } = await adminApi.get('/vitrine/tarification')
    return data
  },

  async update(payload) {
    const { data } = await adminApi.put('/vitrine/tarification', payload)
    return data
  },
}
