import api from './api'
import { USE_MOCKS } from '@/constants/config'
import { mockUser, mockAtelier } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const parametresService = {
  async getProfil() {
    if (USE_MOCKS) {
      await delay()
      return mockUser
    }
    const { data } = await api.get('/parametres/profil')
    return data
  },

  async updateProfil(payload) {
    if (USE_MOCKS) {
      await delay()
      Object.assign(mockUser, payload)
      return mockUser
    }
    const { data } = await api.put('/parametres/profil', payload)
    return data
  },

  async getAtelier() {
    if (USE_MOCKS) {
      await delay()
      return mockAtelier
    }
    const { data } = await api.get('/parametres/atelier')
    return data
  },

  async updateAtelier(payload) {
    if (USE_MOCKS) {
      await delay()
      Object.assign(mockAtelier, payload)
      return mockAtelier
    }
    const { data } = await api.put('/parametres/atelier', payload)
    return data
  },

  async changerMotDePasse(payload) {
    if (USE_MOCKS) {
      await delay()
      return
    }
    await api.put('/parametres/mot-de-passe', payload)
  },
}
