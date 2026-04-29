import api from './api'

export const caisseService = {
  async getStats(mois) {
    const params = mois ? { mois } : {}
    const { data } = await api.get('/caisse/stats', { params })
    return data
  },

  async getClients() {
    const { data } = await api.get('/caisse/clients')
    return data
  },
}
