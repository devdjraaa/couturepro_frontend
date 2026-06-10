import api from './api'

export const commandeEcheanceService = {
  async getAll(commandeId) {
    const { data } = await api.get(`/commandes/${commandeId}/echeances`)
    return data
  },

  async create(commandeId, payload) {
    const { data } = await api.post(`/commandes/${commandeId}/echeances`, payload)
    return data
  },

  async update(commandeId, echeanceId, payload) {
    const { data } = await api.put(`/commandes/${commandeId}/echeances/${echeanceId}`, payload)
    return data
  },

  async delete(commandeId, echeanceId) {
    await api.delete(`/commandes/${commandeId}/echeances/${echeanceId}`)
  },
}
