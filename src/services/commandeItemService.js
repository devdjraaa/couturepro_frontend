import api from './api'

export const commandeItemService = {
  async getAll(commandeId) {
    const { data } = await api.get(`/commandes/${commandeId}/items`)
    return data
  },

  async bulkCreate(commandeId, items) {
    const { data } = await api.post(`/commandes/${commandeId}/items`, { items })
    return data
  },

  async update(commandeId, itemId, payload) {
    const { data } = await api.put(`/commandes/${commandeId}/items/${itemId}`, payload)
    return data
  },

  async delete(commandeId, itemId) {
    await api.delete(`/commandes/${commandeId}/items/${itemId}`)
  },
}
