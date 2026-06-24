import api from './api'

export const vitrineStatsService = {
  // Tracking « fire-and-forget » (public).
  track(atelierId, type) {
    if (!atelierId) return
    api.post(`/vitrine/createurs/${atelierId}/evenement`, { type }).catch(() => {})
  },

  // Agrégats du créateur connecté.
  async getStats() {
    const { data } = await api.get('/vitrine-stats')
    return data
  },
}
