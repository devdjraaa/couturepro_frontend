import api from './api'

export const commandeGroupeService = {
  async getAll() {
    const { data } = await api.get('/commande-groupes')
    return data
  },

  async getById(id) {
    const { data } = await api.get(`/commande-groupes/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await api.post('/commande-groupes', payload)
    return data
  },
}
