import adminApi from '../adminApi'

export const ateliersAdminService = {
  async getAll(params = {}) {
    const { data } = await adminApi.get('/ateliers', { params })
    return data
  },

  async getById(id) {
    const { data } = await adminApi.get(`/ateliers/${id}`)
    return data
  },

  async geler(id) {
    const { data } = await adminApi.post(`/ateliers/${id}/geler`)
    return data
  },

  async degeler(id) {
    const { data } = await adminApi.post(`/ateliers/${id}/degeler`)
    return data
  },

  async getFidelite(id) {
    const { data } = await adminApi.get(`/ateliers/${id}/fidelite`)
    return data
  },

  async ajusterFidelite(id, payload) {
    const { data } = await adminApi.post(`/ateliers/${id}/fidelite/ajuster`, payload)
    return data
  },

  async setDemoMode(id, isDemo) {
    const { data } = await adminApi.post(`/ateliers/${id}/demo`, { is_demo: isDemo })
    return data
  },

  async setTrialDuration(id, payload) {
    const { data } = await adminApi.post(`/ateliers/${id}/trial`, payload)
    return data
  },

  async getSousAteliers(id) {
    const { data } = await adminApi.get(`/ateliers/${id}/sous-ateliers`)
    return data
  },

  // payload: { duree, unite, atelier_ids? } — atelier_ids vide = tous
  async setTrialGlobal(id, payload) {
    const { data } = await adminApi.post(`/ateliers/${id}/trial-global`, payload)
    return data
  },
}
