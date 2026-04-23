import api from './api'
import { USE_MOCKS } from '@/constants/config'
import { mockVetements } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const vetementService = {
  async getAll() {
    if (USE_MOCKS) {
      await delay()
      return mockVetements.filter(v => v.actif)
    }
    const { data } = await api.get('/vetements')
    return data
  },

  async create(payload) {
    if (USE_MOCKS) {
      await delay()
      const newVetement = {
        id: Math.max(...mockVetements.map(v => v.id)) + 1,
        ...payload,
        actif: true,
      }
      mockVetements.push(newVetement)
      return newVetement
    }
    const { data } = await api.post('/vetements', payload)
    return data
  },

  async update(id, payload) {
    if (USE_MOCKS) {
      await delay()
      const idx = mockVetements.findIndex(v => v.id === Number(id))
      if (idx === -1) throw { code: 'non_trouve' }
      mockVetements[idx] = { ...mockVetements[idx], ...payload }
      return mockVetements[idx]
    }
    const { data } = await api.put(`/vetements/${id}`, payload)
    return data
  },

  async delete(id) {
    if (USE_MOCKS) {
      await delay()
      const idx = mockVetements.findIndex(v => v.id === Number(id))
      if (idx !== -1) mockVetements[idx].actif = false
      return
    }
    await api.delete(`/vetements/${id}`)
  },
}
