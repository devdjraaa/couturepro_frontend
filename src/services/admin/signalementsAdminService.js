import adminApi from '../adminApi'

export const signalementsAdminService = {
  async getAll(params = {}) {
    const { data } = await adminApi.get('/signalements', { params })
    return data
  },

  async traiter(id) {
    const { data } = await adminApi.post(`/signalements/${id}/traiter`)
    return data
  },

  // Sanctions applicables depuis la file de modération. Elles existaient côté
  // serveur mais aucun écran ne les appelait : un signalement ne pouvait donc
  // être que « marqué traité », jamais suivi d'effet.
  async masquerAvis(avisId) {
    const { data } = await adminApi.post(`/avis/${avisId}/masquer`)
    return data
  },

  /** Le motif est obligatoire : il est recopié dans l'avis envoyé au créateur. */
  async archiverCreation(vetementId, motif) {
    const { data } = await adminApi.post(`/creations/${vetementId}/archiver`, { motif })
    return data
  },
}
