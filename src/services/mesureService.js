import api from './api'
import { USE_MOCKS } from '@/constants/config'
import { mockMesures } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const mesureService = {
  async getByClient(clientId) {
    if (USE_MOCKS) {
      await delay()
      return mockMesures[clientId] ?? null
    }
    const { data } = await api.get(`/clients/${clientId}/mesures`)
    return data
  },

  async save(clientId, payload) {
    if (USE_MOCKS) {
      await delay()
      const existing = mockMesures[clientId]
      mockMesures[clientId] = {
        id: existing?.id ?? Date.now(),
        client_id: Number(clientId),
        ...payload,
        updated_at: new Date().toISOString(),
      }
      return mockMesures[clientId]
    }
    const existing = await this.getByClient(clientId).catch(() => null)
    if (existing) {
      const { data } = await api.put(`/clients/${clientId}/mesures`, payload)
      return data
    }
    const { data } = await api.post(`/clients/${clientId}/mesures`, payload)
    return data
  },
}
