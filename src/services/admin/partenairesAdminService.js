import adminApi from '../adminApi'

/**
 * Partenaires et candidatures « Devenir partenaire ».
 *
 * Le formulaire public enregistrait bien les candidatures et envoyait un e-mail
 * d'alerte — mais aucun écran ne lisait la table. Si l'e-mail se perdait (boîte
 * pleine, indésirables, adresse changée), la candidature dormait sans que
 * personne le sache. C'est la seule trace durable : elle doit être consultable.
 */
export const partenairesAdminService = {
  /** statut : en_attente | validee | rejetee — sans filtre, tout est renvoyé. */
  async candidatures(params = {}) {
    const { data } = await adminApi.get('/candidatures-partenaires', { params })
    return data
  },

  async changerStatutCandidature(id, statut) {
    const { data } = await adminApi.post(`/candidatures-partenaires/${id}/statut`, { statut })
    return data
  },

  async partenaires(params = {}) {
    const { data } = await adminApi.get('/partenaires', { params })
    return data
  },

  async supprimerPartenaire(id) {
    const { data } = await adminApi.delete(`/partenaires/${id}`)
    return data
  },
}
