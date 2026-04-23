import api from './api'
import { USE_MOCKS } from '@/constants/config'
import { mockCommandes } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const commandeService = {
  async getAll({ statut = '', client_id = null, search = '', page = 1, per_page = 20 } = {}) {
    if (USE_MOCKS) {
      await delay()
      let list = [...mockCommandes]
      if (statut) list = list.filter(c => c.statut === statut)
      if (client_id) list = list.filter(c => c.client_id === Number(client_id))
      if (search) {
        const q = search.toLowerCase()
        list = list.filter(c =>
          c.client_nom.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
        )
      }
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      return { data: list, total: list.length, page, per_page }
    }
    const { data } = await api.get('/commandes', { params: { statut, client_id, search, page, per_page } })
    return data
  },

  async getById(id) {
    if (USE_MOCKS) {
      await delay()
      const commande = mockCommandes.find(c => c.id === Number(id))
      if (!commande) throw { code: 'non_trouve' }
      return commande
    }
    const { data } = await api.get(`/commandes/${id}`)
    return data
  },

  async create(payload) {
    if (USE_MOCKS) {
      await delay()
      const newCommande = {
        id: Math.max(...mockCommandes.map(c => c.id)) + 1,
        ...payload,
        statut: 'en_cours',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockCommandes.push(newCommande)
      return newCommande
    }
    const { data } = await api.post('/commandes', payload)
    return data
  },

  async update(id, payload) {
    if (USE_MOCKS) {
      await delay()
      const idx = mockCommandes.findIndex(c => c.id === Number(id))
      if (idx === -1) throw { code: 'non_trouve' }
      mockCommandes[idx] = { ...mockCommandes[idx], ...payload, updated_at: new Date().toISOString() }
      return mockCommandes[idx]
    }
    const { data } = await api.put(`/commandes/${id}`, payload)
    return data
  },

  async updateStatut(id, statut) {
    if (USE_MOCKS) {
      await delay()
      const idx = mockCommandes.findIndex(c => c.id === Number(id))
      if (idx === -1) throw { code: 'non_trouve' }
      mockCommandes[idx].statut = statut
      mockCommandes[idx].updated_at = new Date().toISOString()
      return mockCommandes[idx]
    }
    const { data } = await api.patch(`/commandes/${id}/statut`, { statut })
    return data
  },

  async delete(id) {
    if (USE_MOCKS) {
      await delay()
      const idx = mockCommandes.findIndex(c => c.id === Number(id))
      if (idx !== -1) mockCommandes.splice(idx, 1)
      return
    }
    await api.delete(`/commandes/${id}`)
  },

  async getStats() {
    if (USE_MOCKS) {
      await delay(200)
      const actives = mockCommandes.filter(c => ['en_cours', 'essai'].includes(c.statut))
      return {
        en_cours: mockCommandes.filter(c => c.statut === 'en_cours').length,
        essai:    mockCommandes.filter(c => c.statut === 'essai').length,
        livre:    mockCommandes.filter(c => c.statut === 'livre').length,
        annule:   mockCommandes.filter(c => c.statut === 'annule').length,
        total_encaisse: mockCommandes
          .filter(c => c.statut !== 'annule')
          .reduce((sum, c) => sum + c.avance, 0),
        total_restant: actives
          .reduce((sum, c) => sum + Math.max(0, c.montant - c.avance), 0),
      }
    }
    const { data } = await api.get('/commandes/stats')
    return data
  },
}
