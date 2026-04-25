import api from '@/services/api'

export const equipeService = {
  async getAll() {
    const { data } = await api.get('/equipe')
    return data
  },

  async invite(payload) {
    const { data } = await api.post('/equipe', payload)
    return data
  },

  async remove(membreId) {
    await api.delete(`/equipe/${membreId}`)
  },
}
