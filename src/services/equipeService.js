import api from './api'
import { USE_MOCKS } from '@/constants/config'
import { mockEquipe } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const equipeService = {
  async getAll() {
    if (USE_MOCKS) {
      await delay()
      return mockEquipe.filter(m => m.actif)
    }
    const { data } = await api.get('/equipe')
    return data
  },

  async invite(payload) {
    if (USE_MOCKS) {
      await delay()
      const newMembre = {
        id: Math.max(...mockEquipe.map(m => m.id)) + 1,
        ...payload,
        actif: true,
        joined_at: new Date().toISOString(),
      }
      mockEquipe.push(newMembre)
      return newMembre
    }
    const { data } = await api.post('/equipe/inviter', payload)
    return data
  },

  async updateRole(membreId, role) {
    if (USE_MOCKS) {
      await delay()
      const membre = mockEquipe.find(m => m.id === Number(membreId))
      if (!membre) throw { code: 'non_trouve' }
      membre.role = role
      return membre
    }
    const { data } = await api.patch(`/equipe/${membreId}/role`, { role })
    return data
  },

  async remove(membreId) {
    if (USE_MOCKS) {
      await delay()
      const membre = mockEquipe.find(m => m.id === Number(membreId))
      if (membre) membre.actif = false
      return
    }
    await api.delete(`/equipe/${membreId}`)
  },
}
