import api from './api'
import { isMock } from '@/services/mockFlag'
import { mockCommandes } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const commandeService = {
  async getAll({ statut = '', client_id = null } = {}) {
    if (isMock()) {
      await delay()
      let list = [...mockCommandes]
      if (statut)    list = list.filter(c => c.statut === statut)
      if (client_id) list = list.filter(c => c.client_id === client_id || c.client_id === Number(client_id))
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      return list
    }
    const params = {}
    if (statut)    params.statut    = statut
    if (client_id) params.client_id = client_id
    const { data } = await api.get('/commandes', { params })
    return data
  },

  async getById(id) {
    if (isMock()) {
      await delay()
      const commande = mockCommandes.find(c => c.id === id || c.id === Number(id))
      if (!commande) throw { code: 'non_trouve' }
      return commande
    }
    const { data } = await api.get(`/commandes/${id}`)
    return data
  },

  async create(payload) {
    if (isMock()) {
      await delay()
      const newCommande = {
        id: String(Date.now()),
        ...payload,
        statut: 'en_cours',
        date_commande: new Date().toISOString().split('T')[0],
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
    if (isMock()) {
      await delay()
      const idx = mockCommandes.findIndex(c => c.id === id || c.id === Number(id))
      if (idx === -1) throw { code: 'non_trouve' }
      mockCommandes[idx] = { ...mockCommandes[idx], ...payload, updated_at: new Date().toISOString() }
      return mockCommandes[idx]
    }
    const { data } = await api.put(`/commandes/${id}`, payload)
    return data
  },

  async updateStatut(id, statut) {
    if (isMock()) {
      await delay()
      const idx = mockCommandes.findIndex(c => c.id === id || c.id === Number(id))
      if (idx === -1) throw { code: 'non_trouve' }
      mockCommandes[idx].statut = statut
      mockCommandes[idx].updated_at = new Date().toISOString()
      return mockCommandes[idx]
    }
    const { data } = await api.put(`/commandes/${id}`, { statut })
    return data
  },

  async delete(id) {
    if (isMock()) {
      await delay()
      const idx = mockCommandes.findIndex(c => c.id === id || c.id === Number(id))
      if (idx !== -1) mockCommandes.splice(idx, 1)
      return
    }
    await api.delete(`/commandes/${id}`)
  },

  async getStats() {
    if (isMock()) {
      await delay(200)
      const actives = mockCommandes.filter(c => c.statut === 'en_cours')
      return {
        en_cours:       mockCommandes.filter(c => c.statut === 'en_cours').length,
        livre:          mockCommandes.filter(c => c.statut === 'livre').length,
        annule:         mockCommandes.filter(c => c.statut === 'annule').length,
        total_encaisse: mockCommandes
          .filter(c => c.statut !== 'annule')
          .reduce((s, c) => s + (c.acompte ?? 0), 0),
        total_restant:  actives
          .reduce((s, c) => s + Math.max(0, (c.prix ?? 0) - (c.acompte ?? 0)), 0),
      }
    }
    // Pas d'endpoint /commandes/stats — calcul côté client
    const { data: list } = await api.get('/commandes')
    const actives = list.filter(c => c.statut === 'en_cours')
    return {
      en_cours:       list.filter(c => c.statut === 'en_cours').length,
      livre:          list.filter(c => c.statut === 'livre').length,
      annule:         list.filter(c => c.statut === 'annule').length,
      total_encaisse: list.filter(c => c.statut !== 'annule').reduce((s, c) => s + Number(c.acompte ?? 0), 0),
      total_restant:  actives.reduce((s, c) => s + Math.max(0, Number(c.prix ?? 0) - Number(c.acompte ?? 0)), 0),
    }
  },
}
