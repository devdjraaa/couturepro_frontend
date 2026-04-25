import api from './api'
import { isMock } from '@/services/mockFlag'
import { mockMesures } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const mesureService = {
  async getByClient(clientId) {
    if (isMock()) {
      await delay()
      const m = mockMesures[clientId] ?? null
      return Array.isArray(m) ? (m[0] ?? null) : m
    }
    const { data } = await api.get(`/clients/${clientId}/mesures`)
    return data // single object or null
  },

  async save(clientId, champs) {
    if (isMock()) {
      await delay()
      const existing = mockMesures[clientId]
      const record = existing && !Array.isArray(existing) ? existing : { id: String(Date.now()), client_id: clientId }
      mockMesures[clientId] = { ...record, champs, updated_at: new Date().toISOString() }
      return mockMesures[clientId]
    }
    const { data } = await api.post('/mesures', { client_id: clientId, champs })
    return data
  },
}
