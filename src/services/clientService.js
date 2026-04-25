import api from './api'
import { USE_MOCKS } from '@/constants/config'
import { mockClients } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const clientService = {
  async getAll({ search = '', type_profil = '' } = {}) {
    if (USE_MOCKS) {
      await delay()
      let list = [...mockClients]
      if (search) {
        const q = search.toLowerCase()
        list = list.filter(c =>
          c.nom.toLowerCase().includes(q) ||
          c.prenom?.toLowerCase().includes(q) ||
          c.telephone?.includes(q)
        )
      }
      if (type_profil) list = list.filter(c => c.type_profil === type_profil)
      return list.filter(c => !c.is_archived)
    }
    const params = {}
    if (search)      params.search      = search
    if (type_profil) params.type_profil = type_profil
    const { data } = await api.get('/clients', { params })
    return data
  },

  async getById(id) {
    if (USE_MOCKS) {
      await delay()
      const client = mockClients.find(c => c.id === id || c.id === Number(id))
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
        id: String(Date.now()),
        ...payload,
        is_archived: false,
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
      const idx = mockClients.findIndex(c => c.id === id || c.id === Number(id))
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
      const idx = mockClients.findIndex(c => c.id === id || c.id === Number(id))
      if (idx !== -1) mockClients.splice(idx, 1)
      return
    }
    await api.delete(`/clients/${id}`)
  },

  async archiver(id) {
    if (USE_MOCKS) {
      await delay()
      const client = mockClients.find(c => c.id === id || c.id === Number(id))
      if (!client) throw { code: 'non_trouve' }
      client.is_archived = true
      client.archived_at = new Date().toISOString()
      return client
    }
    const { data } = await api.post(`/clients/${id}/archiver`)
    return data
  },

  async toggleVip(id) {
    if (USE_MOCKS) {
      await delay()
      const client = mockClients.find(c => c.id === id || c.id === Number(id))
      if (!client) throw { code: 'non_trouve' }
      // Dans le mock : bascule entre 'vip' et 'regulier' via type_profil fictif
      client.type_profil = client.type_profil === 'vip' ? 'mixte' : 'vip'
      return client
    }
    // Pas de concept VIP dans le backend — bascule via update
    const client = await this.getById(id)
    const newProfil = client.type_profil === 'vip' ? 'mixte' : 'vip'
    const { data } = await api.put(`/clients/${id}`, { type_profil: newProfil })
    return data
  },
}
