import api from './api'
import { isMock } from '@/services/mockFlag'
import { mockMesures } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const mesureService = {
  // Retourne un tableau de mesures pour un client (une mesure par type de vêtement)
  async getByClient(clientId) {
    if (isMock()) {
      await delay()
      const mesures = mockMesures[clientId] ?? []
      return Array.isArray(mesures) ? mesures : [mesures]
    }
    const { data } = await api.get(`/clients/${clientId}/mesures`)
    return data
  },

  // Crée ou met à jour une mesure pour un client + type de vêtement donné
  // champs = objet { poitrine: 92, tour_de_taille: 70, ... }
  async save(clientId, vetementId, champs) {
    if (isMock()) {
      await delay()
      if (!mockMesures[clientId]) mockMesures[clientId] = []
      const list = Array.isArray(mockMesures[clientId]) ? mockMesures[clientId] : [mockMesures[clientId]]
      const idx = list.findIndex(m => m.vetement_id === vetementId)
      if (idx >= 0) {
        list[idx] = { ...list[idx], champs, updated_at: new Date().toISOString() }
        mockMesures[clientId] = list
        return list[idx]
      }
      const newMesure = {
        id: String(Date.now()),
        client_id: clientId,
        vetement_id: vetementId,
        champs,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      list.push(newMesure)
      mockMesures[clientId] = list
      return newMesure
    }
    const existing = (await this.getByClient(clientId)).find(m => m.vetement_id === vetementId)
    if (existing?.id) {
      const { data } = await api.put(`/mesures/${existing.id}`, { champs })
      return data
    }
    const { data } = await api.post('/mesures', { client_id: clientId, vetement_id: vetementId, champs })
    return data
  },

  async delete(mesureId) {
    if (isMock()) {
      await delay()
      Object.keys(mockMesures).forEach(cid => {
        const list = mockMesures[cid]
        if (Array.isArray(list)) {
          mockMesures[cid] = list.filter(m => m.id !== mesureId)
        }
      })
      return
    }
    await api.delete(`/mesures/${mesureId}`)
  },
}
