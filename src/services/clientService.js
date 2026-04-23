import api from './api'
import { USE_MOCKS } from '@/constants/config'
import { mockClients } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const clientService = {
  async getAll({ search = '', profil = '', page = 1, per_page = 20 } = {}) {
    if (USE_MOCKS) {
      await delay()
      let list = [...mockClients]
      if (search) {
        const q = search.toLowerCase()
        list = list.filter(c =>
          c.nom.toLowerCase().includes(q) || c.telephone.includes(q)
        )
      }
      if (profil) list = list.filter(c => c.profil === profil)
      return { data: list, total: list.length, page, per_page }
    }
    const { data } = await api.get('/clients', { params: { search, profil, page, per_page } })
    return data
  },

  async getById(id) {
    if (USE_MOCKS) {
      await delay()
      const client = mockClients.find(c => c.id === Number(id))
      if (!client) throw { code: 'non_trouve' }
      return client
    }
    const { data } = await api.get(`/clients/${id}`)
    return data
  },

  async create(payload) {
    if (USE_MOCKS) {
      await delay()
      const newClient = {
        id: Math.max(...mockClients.map(c => c.id)) + 1,
        ...payload,
        profil: 'occasionnel',
        points: 0,
        commandes_count: 0,
        commandes_actives: 0,
        derniere_commande: null,
        photo_url: null,
        created_at: new Date().toISOString(),
      }
      mockClients.push(newClient)
      return newClient
    }
    const { data } = await api.post('/clients', payload)
    return data
  },

  async update(id, payload) {
    if (USE_MOCKS) {
      await delay()
      const idx = mockClients.findIndex(c => c.id === Number(id))
      if (idx === -1) throw { code: 'non_trouve' }
      mockClients[idx] = { ...mockClients[idx], ...payload }
      return mockClients[idx]
    }
    const { data } = await api.put(`/clients/${id}`, payload)
    return data
  },

  async delete(id) {
    if (USE_MOCKS) {
      await delay()
      const idx = mockClients.findIndex(c => c.id === Number(id))
      if (idx !== -1) mockClients.splice(idx, 1)
      return
    }
    await api.delete(`/clients/${id}`)
  },

  async toggleVip(id) {
    if (USE_MOCKS) {
      await delay()
      const client = mockClients.find(c => c.id === Number(id))
      if (!client) throw { code: 'non_trouve' }
      client.profil = client.profil === 'vip' ? 'regulier' : 'vip'
      return client
    }
    const { data } = await api.post(`/clients/${id}/toggle-vip`)
    return data
  },
}
